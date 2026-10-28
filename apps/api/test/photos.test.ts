import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import postgres from "postgres";
import sharp from "sharp";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, photoSchema } from "@bordo/shared/photos";
import { z } from "zod";

import { createTestApp } from "./helpers/create-test-app.js";
import { multipart } from "./helpers/multipart.js";

const databaseUrl = inject("testDatabaseUrl");
const PASSWORD = "Senha-forte-1";
const photoList = z.array(photoSchema);

const jpeg = (width = 120, height = 80, color = "#0E7C86") =>
  sharp({ create: { width, height, channels: 3, background: color } })
    .jpeg()
    .toBuffer();
const png = (width = 60, height = 60) =>
  sharp({ create: { width, height, channels: 4, background: "#E8734A" } })
    .png()
    .toBuffer();
const webp = () =>
  sharp({ create: { width: 40, height: 40, channels: 3, background: "#fff" } })
    .webp()
    .toBuffer();

describe.skipIf(!databaseUrl)("photos (real Postgres, files on disk)", () => {
  let sql: postgres.Sql;
  let app: NestFastifyApplication;
  let storageDir: string;

  beforeAll(async () => {
    sql = postgres(databaseUrl!, { max: 2 });
    storageDir = await mkdtemp(join(tmpdir(), "bordo-photos-"));
  });
  afterAll(async () => {
    await sql.end();
    await rm(storageDir, { recursive: true, force: true });
  });
  beforeEach(async () => {
    await sql`truncate table users cascade`;
    await rm(storageDir, { recursive: true, force: true });
    app = await createTestApp({ DATABASE_URL: databaseUrl!, STORAGE_LOCAL_DIR: storageDir });
  });
  afterEach(async () => {
    await app.close();
  });

  const filesOnDisk = async () =>
    (await readdir(storageDir, { recursive: true, withFileTypes: true }).catch(() => []))
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name));

  const signUp = async (email = "marina@email.com") => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up",
      payload: { email, password: PASSWORD },
    });
    const cookie = response.cookies.find((item) => item.name === "bordo_session")!;
    return { id: response.json().id as string, cookie: `bordo_session=${cookie.value}` };
  };

  const newTrip = async (userId: string) => {
    const [row] = await sql`
      insert into trips (user_id, name, destination, start_date, end_date, currency, budget_cents)
      values (${userId}, 'Lisboa', 'Portugal', '2026-10-12', '2026-10-26', 'EUR', 500000)
      returning id`;
    return row.id as string;
  };

  async function setup(email = "marina@email.com") {
    const user = await signUp(email);
    return { ...user, tripId: await newTrip(user.id) };
  }
  type Ctx = Awaited<ReturnType<typeof setup>>;

  const upload = (
    ctx: Ctx,
    files: { data: Buffer; filename?: string; contentType?: string; field?: string }[],
  ) => {
    const form = multipart(
      files.map((file, index) => ({
        field: file.field ?? "files",
        filename: file.filename ?? `foto-${index}.jpg`,
        data: file.data,
        contentType: file.contentType ?? "image/jpeg",
      })),
    );
    return app.inject({
      method: "POST",
      url: `/api/trips/${ctx.tripId}/photos`,
      headers: { ...form.headers, cookie: ctx.cookie },
      payload: form.payload,
    });
  };

  const list = async (ctx: Ctx) =>
    photoList.parse(
      (
        await app.inject({
          url: `/api/trips/${ctx.tripId}/photos`,
          headers: { cookie: ctx.cookie },
        })
      ).json(),
    );

  describe("POST /trips/:tripId/photos", () => {
    it("requires a session", async () => {
      const ctx = await setup();
      const form = multipart([{ field: "files", filename: "a.jpg", data: await jpeg() }]);
      const response = await app.inject({
        method: "POST",
        url: `/api/trips/${ctx.tripId}/photos`,
        headers: form.headers,
        payload: form.payload,
      });
      expect(response.statusCode).toBe(401);
    });

    it("stores the files, answers 201 in the shared shape and makes the first photo the cover", async () => {
      const ctx = await setup();
      const response = await upload(ctx, [
        { data: await jpeg(), filename: "capa.jpg" },
        { data: await png(), filename: "praia.png", contentType: "image/png" },
      ]);
      expect(response.statusCode).toBe(201);
      const photos = photoList.parse(response.json());

      expect(photos.map((photo) => photo.name)).toEqual(["capa.jpg", "praia.png"]);
      expect(photos.map((photo) => photo.isCover)).toEqual([true, false]);
      expect(photos.every((photo) => photo.tripId === ctx.tripId)).toBe(true);
      expect(photos[0].url).toMatch(
        new RegExp(`^/api/media/trips/${ctx.tripId}/[0-9a-f-]{36}\\.jpg$`),
      );
      expect(photos[1].url).toMatch(/\.png$/);

      expect(await filesOnDisk()).toHaveLength(2);
      const rows = await sql`select width, height from photos order by name`;
      expect(rows[0]).toMatchObject({ width: 120, height: 80 });
      const [trip] = await sql`select cover_photo_id from trips where id = ${ctx.tripId}`;
      expect(trip.cover_photo_id).toBe(photos[0].id);
    });

    it("keeps the existing cover when more photos arrive", async () => {
      const ctx = await setup();
      const first = (await upload(ctx, [{ data: await jpeg() }])).json()[0];
      await upload(ctx, [{ data: await jpeg(50, 50) }]);
      const photos = await list(ctx);
      expect(photos[0].id).toBe(first.id);
      expect(photos.map((photo) => photo.isCover)).toEqual([true, false]);
    });

    it("strips the metadata (including the location), turns the image upright and shrinks it", async () => {
      const ctx = await setup();
      const tagged = await sharp({
        create: { width: 100, height: 50, channels: 3, background: "#123456" },
      })
        .jpeg()
        .withExif({ IFD0: { ImageDescription: "praia secreta", Copyright: "Marina" } })
        .withMetadata({ orientation: 6 })
        .toBuffer();
      expect((await sharp(tagged).metadata()).exif).toBeDefined();
      const big = await jpeg(4000, 3000);

      const photos = (await upload(ctx, [{ data: tagged }, { data: big }])).json();
      const stored = await filesOnDisk();
      const byKey = (id: string) =>
        stored.find((path) =>
          path.endsWith(
            photos
              .find((p: { id: string }) => p.id === id)
              .url.split("/")
              .pop(),
          ),
        )!;

      const upright = await sharp(byKey(photos[0].id)).metadata();
      expect(upright.exif).toBeUndefined();
      expect([upright.width, upright.height]).toEqual([50, 100]);

      const shrunk = await sharp(byKey(photos[1].id)).metadata();
      expect(Math.max(shrunk.width!, shrunk.height!)).toBe(2560);
      const rows = await sql`select width, height from photos order by created_at, id`;
      expect([rows[0].width, rows[0].height]).toEqual([50, 100]);
      expect([rows[1].width, rows[1].height]).toEqual([2560, 1920]);
    });

    it("sanitizes the file name", async () => {
      const ctx = await setup();
      const photos = (
        await upload(ctx, [{ data: await jpeg(), filename: "../../etc/passwd\u0001.jpg" }])
      ).json();
      expect(photos[0].name).toBe("passwd.jpg");
    });

    it("decodes the image instead of trusting the declared type", async () => {
      const ctx = await setup();
      const fake = Buffer.from("<script>alert(1)</script>");
      for (const files of [
        [{ data: fake, contentType: "image/jpeg" }],
        [{ data: Buffer.from("GIF89a....", "ascii"), filename: "x.gif", contentType: "image/gif" }],
        [{ data: await webp(), filename: "x.webp", contentType: "image/webp" }],
      ]) {
        const response = await upload(ctx, files);
        expect(response.statusCode).toBe(422);
      }
      expect(await filesOnDisk()).toHaveLength(0);
      expect(await sql`select 1 from photos`).toHaveLength(0);
    });

    it("rejects a decompression bomb", async () => {
      const ctx = await setup();
      const bomb = await sharp({
        create: { width: 9000, height: 9000, channels: 3, background: "#000" },
      })
        .png({ compressionLevel: 9 })
        .toBuffer();
      expect((await upload(ctx, [{ data: bomb, filename: "bomba.png" }])).statusCode).toBe(422);
    });

    it("rejects a file over the size limit with 413 and stores nothing", async () => {
      const ctx = await setup();
      const huge = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(MAX_PHOTO_BYTES)]);
      const response = await upload(ctx, [{ data: await jpeg() }, { data: huge }]);
      expect(response.statusCode).toBe(413);
      expect(await filesOnDisk()).toHaveLength(0);
      expect(await sql`select 1 from photos`).toHaveLength(0);
    });

    it("rejects an empty request and files under the wrong field", async () => {
      const ctx = await setup();
      expect((await upload(ctx, [])).statusCode).toBe(422);
      expect((await upload(ctx, [{ data: await jpeg(), field: "photo" }])).statusCode).toBe(422);
      const json = await app.inject({
        method: "POST",
        url: `/api/trips/${ctx.tripId}/photos`,
        headers: { cookie: ctx.cookie },
        payload: { files: [] },
      });
      expect(json.statusCode).toBe(422);
    });

    it("rejects the whole batch if one file is bad", async () => {
      const ctx = await setup();
      const response = await upload(ctx, [{ data: await jpeg() }, { data: Buffer.from("nope") }]);
      expect(response.statusCode).toBe(422);
      expect(await filesOnDisk()).toHaveLength(0);
      expect(await list(ctx)).toEqual([]);
    });

    it(`allows at most ${MAX_PHOTOS} photos per trip, counting the ones already there`, async () => {
      const ctx = await setup();
      const image = await jpeg(20, 20);
      const batch = (count: number) => Array.from({ length: count }, () => ({ data: image }));

      expect((await upload(ctx, batch(MAX_PHOTOS))).statusCode).toBe(201);
      expect((await upload(ctx, batch(1))).statusCode).toBe(422);
      expect(await list(ctx)).toHaveLength(MAX_PHOTOS);
      expect(await filesOnDisk()).toHaveLength(MAX_PHOTOS);
      expect((await upload(ctx, batch(MAX_PHOTOS + 1))).statusCode).toBe(422);
    });

    it("keeps the limit when two uploads race", async () => {
      const ctx = await setup();
      const image = await jpeg(20, 20);
      const batch = Array.from({ length: 6 }, () => ({ data: image }));
      const results = await Promise.all([upload(ctx, batch), upload(ctx, batch)]);

      expect(results.map((result) => result.statusCode).sort()).toEqual([201, 422]);
      expect(await list(ctx)).toHaveLength(6);
      expect(await filesOnDisk()).toHaveLength(6);
    });

    it("answers 404 for another user's trip and stores nothing", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      const response = await upload({ ...ctx, tripId: other.tripId }, [{ data: await jpeg() }]);
      expect(response.statusCode).toBe(404);
      expect(await filesOnDisk()).toHaveLength(0);
    });

    it("only accepts multipart on upload routes", async () => {
      const ctx = await setup();
      const form = multipart([{ field: "files", filename: "a.jpg", data: await jpeg() }]);
      const response = await app.inject({
        method: "POST",
        url: "/api/trips",
        headers: { ...form.headers, cookie: ctx.cookie },
        payload: form.payload,
      });
      expect(response.statusCode).toBe(415);
    });
  });

  describe("GET /media/*", () => {
    it("serves a stored photo to anyone, with the right type and long cache", async () => {
      const ctx = await setup();
      const [photo] = (await upload(ctx, [{ data: await jpeg() }])).json();

      const response = await app.inject({ url: photo.url });
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/jpeg");
      expect(response.headers["cache-control"]).toBe("public, max-age=31536000, immutable");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect((await sharp(response.rawPayload).metadata()).format).toBe("jpeg");
    });

    it("is not rate limited", async () => {
      app = await (async () => {
        await app.close();
        return createTestApp({
          DATABASE_URL: databaseUrl!,
          STORAGE_LOCAL_DIR: storageDir,
          THROTTLE_LIMIT: "2",
        });
      })();
      const ctx = await setup();
      const [photo] = (await upload(ctx, [{ data: await jpeg() }])).json();
      for (let hit = 0; hit < 6; hit++) {
        expect((await app.inject({ url: photo.url })).statusCode).toBe(200);
      }
    });

    it("answers 404 for unknown keys and never leaves the storage folder", async () => {
      const ctx = await setup();
      await upload(ctx, [{ data: await jpeg() }]);
      const attacks = [
        "/api/media/trips/00000000-0000-4000-8000-000000000000/00000000-0000-4000-8000-000000000000.jpg",
        "/api/media/..%2F..%2F..%2Fetc%2Fpasswd",
        "/api/media/trips/../../package.json",
        "/api/media/%2e%2e/%2e%2e/package.json",
        "/api/media/trips",
        "/api/media/",
        "/api/media/trips/x/y.html",
      ];
      for (const url of attacks) {
        const response = await app.inject({ url });
        expect(response.statusCode).toBe(404);
      }
    });
  });

  describe("GET /trips/:tripId/photos", () => {
    it("lists the cover first and then in upload order", async () => {
      const ctx = await setup();
      const uploaded = (
        await upload(ctx, [
          { data: await jpeg(), filename: "1.jpg" },
          { data: await jpeg(30, 30), filename: "2.jpg" },
          { data: await jpeg(40, 40), filename: "3.jpg" },
        ])
      ).json();
      await app.inject({
        method: "PUT",
        url: `/api/trips/${ctx.tripId}/cover`,
        headers: { cookie: ctx.cookie },
        payload: { photoId: uploaded[2].id },
      });

      const photos = await list(ctx);
      expect(photos.map((photo) => photo.name)).toEqual(["3.jpg", "1.jpg", "2.jpg"]);
      expect(photos.map((photo) => photo.isCover)).toEqual([true, false, false]);
    });

    it("is empty for a trip without photos and 404 for another user's trip", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      expect(await list(ctx)).toEqual([]);
      const response = await app.inject({
        url: `/api/trips/${other.tripId}/photos`,
        headers: { cookie: ctx.cookie },
      });
      expect(response.statusCode).toBe(404);
    });

    it("shows up as the trip cover in the trips list", async () => {
      const ctx = await setup();
      const [photo] = (await upload(ctx, [{ data: await jpeg() }])).json();
      const trips = (
        await app.inject({ url: "/api/trips", headers: { cookie: ctx.cookie } })
      ).json();
      expect(trips[0].coverPhotoUrl).toBe(photo.url);
      const trip = (
        await app.inject({ url: `/api/trips/${ctx.tripId}`, headers: { cookie: ctx.cookie } })
      ).json();
      expect(trip.coverPhotoUrl).toBe(photo.url);
    });
  });

  describe("PUT /trips/:tripId/cover", () => {
    const setCover = (ctx: Ctx, payload: object, tripId = ctx.tripId) =>
      app.inject({
        method: "PUT",
        url: `/api/trips/${tripId}/cover`,
        headers: { cookie: ctx.cookie },
        payload,
      });

    it("changes the cover", async () => {
      const ctx = await setup();
      const uploaded = (
        await upload(ctx, [{ data: await jpeg() }, { data: await jpeg(30, 30) }])
      ).json();
      const response = await setCover(ctx, { photoId: uploaded[1].id });
      expect(response.statusCode).toBe(200);
      expect(photoSchema.parse(response.json())).toMatchObject({
        id: uploaded[1].id,
        isCover: true,
      });
      expect((await list(ctx))[0].id).toBe(uploaded[1].id);
    });

    it("answers 404 for a photo of another trip or user, and 400 for a malformed id", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      const theirs = (await upload(other, [{ data: await jpeg() }])).json()[0];
      const secondTrip = await newTrip(ctx.id);

      expect((await setCover(ctx, { photoId: theirs.id })).statusCode).toBe(404);
      expect((await setCover(ctx, { photoId: theirs.id }, other.tripId)).statusCode).toBe(404);
      expect((await setCover(ctx, { photoId: theirs.id }, secondTrip)).statusCode).toBe(404);
      expect((await setCover(ctx, { photoId: "nope" })).statusCode).toBe(400);
    });
  });

  describe("DELETE /trips/:tripId/photos/:photoId", () => {
    const remove = (ctx: Ctx, photoId: string, tripId = ctx.tripId) =>
      app.inject({
        method: "DELETE",
        url: `/api/trips/${tripId}/photos/${photoId}`,
        headers: { cookie: ctx.cookie },
      });

    it("deletes the row and the file", async () => {
      const ctx = await setup();
      const uploaded = (
        await upload(ctx, [{ data: await jpeg() }, { data: await jpeg(30, 30) }])
      ).json();
      const response = await remove(ctx, uploaded[1].id);
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ id: uploaded[1].id });
      expect(await filesOnDisk()).toHaveLength(1);
      expect((await app.inject({ url: uploaded[1].url })).statusCode).toBe(404);
      expect((await list(ctx)).map((photo) => photo.id)).toEqual([uploaded[0].id]);
    });

    it("promotes the oldest remaining photo when the cover is deleted, and clears it after the last", async () => {
      const ctx = await setup();
      const uploaded = (
        await upload(ctx, [
          { data: await jpeg() },
          { data: await jpeg(30, 30) },
          { data: await jpeg(40, 40) },
        ])
      ).json();

      await remove(ctx, uploaded[0].id);
      let photos = await list(ctx);
      expect(photos.map((photo) => photo.id)).toEqual([uploaded[1].id, uploaded[2].id]);
      expect(photos[0].isCover).toBe(true);

      await remove(ctx, uploaded[1].id);
      await remove(ctx, uploaded[2].id);
      photos = await list(ctx);
      expect(photos).toEqual([]);
      const [trip] = await sql`select cover_photo_id from trips where id = ${ctx.tripId}`;
      expect(trip.cover_photo_id).toBeNull();
      expect(await filesOnDisk()).toHaveLength(0);
    });

    it("answers 404 and leaves everything when the photo is not the user's", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      const theirs = (await upload(other, [{ data: await jpeg() }])).json()[0];
      expect((await remove(ctx, theirs.id)).statusCode).toBe(404);
      expect((await remove(ctx, theirs.id, other.tripId)).statusCode).toBe(404);
      expect((await remove(ctx, "nope")).statusCode).toBe(400);
      expect(await filesOnDisk()).toHaveLength(1);
      expect(await sql`select 1 from photos`).toHaveLength(1);
    });
  });

  describe("profile photo", () => {
    const putPhoto = (
      ctx: { cookie: string },
      data: Buffer,
      options: { field?: string; type?: string } = {},
    ) => {
      const form = multipart([
        {
          field: options.field ?? "photo",
          filename: "eu.png",
          data,
          contentType: options.type ?? "image/png",
        },
      ]);
      return app.inject({
        method: "PUT",
        url: "/api/profile/photo",
        headers: { ...form.headers, cookie: ctx.cookie },
        payload: form.payload,
      });
    };

    it("sets the photo, serves it and returns it in the profile", async () => {
      const ctx = await setup();
      const response = await putPhoto(ctx, await png());
      expect(response.statusCode).toBe(200);
      const profile = response.json();
      expect(profile.photoUrl).toMatch(
        new RegExp(`^/api/media/avatars/${ctx.id}/[0-9a-f-]{36}\\.png$`),
      );
      expect((await app.inject({ url: profile.photoUrl })).statusCode).toBe(200);
      const me = (
        await app.inject({ url: "/api/profile", headers: { cookie: ctx.cookie } })
      ).json();
      expect(me.photoUrl).toBe(profile.photoUrl);
      expect(
        (await app.inject({ url: "/api/auth/session", headers: { cookie: ctx.cookie } })).json()
          .photoUrl,
      ).toBe(profile.photoUrl);
    });

    it("accepts JPG, PNG and WEBP and replaces the previous file", async () => {
      const ctx = await setup();
      await putPhoto(ctx, await png());
      const second = await putPhoto(ctx, await webp(), { type: "image/webp" });
      expect(second.statusCode).toBe(200);
      expect(second.json().photoUrl).toMatch(/\.webp$/);
      expect(await filesOnDisk()).toHaveLength(1);
    });

    it("rejects other formats, wrong fields, an empty body and files over 5 MB", async () => {
      const ctx = await setup();
      expect(
        (await putPhoto(ctx, Buffer.from("GIF89a....", "ascii"), { type: "image/gif" })).statusCode,
      ).toBe(422);
      expect((await putPhoto(ctx, await png(), { field: "files" })).statusCode).toBe(422);
      const huge = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47]),
        Buffer.alloc(5 * 1024 * 1024),
      ]);
      expect((await putPhoto(ctx, huge)).statusCode).toBe(413);
      expect(await filesOnDisk()).toHaveLength(0);
      const me = (
        await app.inject({ url: "/api/profile", headers: { cookie: ctx.cookie } })
      ).json();
      expect(me.photoUrl).toBeNull();
    });

    it("removes the photo and its file", async () => {
      const ctx = await setup();
      await putPhoto(ctx, await png());
      const response = await app.inject({
        method: "DELETE",
        url: "/api/profile/photo",
        headers: { cookie: ctx.cookie },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().photoUrl).toBeNull();
      expect(await filesOnDisk()).toHaveLength(0);
    });

    it("does not try to delete a Google photo URL, and replaces it", async () => {
      const ctx = await setup();
      await sql`update users set photo_url = 'https://lh3.googleusercontent.com/a/abc' where id = ${ctx.id}`;
      const before = (
        await app.inject({ url: "/api/profile", headers: { cookie: ctx.cookie } })
      ).json();
      expect(before.photoUrl).toBe("https://lh3.googleusercontent.com/a/abc");

      expect((await putPhoto(ctx, await png())).statusCode).toBe(200);
      const cleared = await app.inject({
        method: "DELETE",
        url: "/api/profile/photo",
        headers: { cookie: ctx.cookie },
      });
      expect(cleared.statusCode).toBe(200);
    });

    it("requires a session", async () => {
      const form = multipart([{ field: "photo", filename: "a.png", data: await png() }]);
      const response = await app.inject({
        method: "PUT",
        url: "/api/profile/photo",
        headers: form.headers,
        payload: form.payload,
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("account deletion", () => {
    it("removes every file of the account and none of another user's", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      await upload(ctx, [{ data: await jpeg() }, { data: await jpeg(30, 30) }]);
      const form = multipart([
        { field: "photo", filename: "eu.png", data: await png(), contentType: "image/png" },
      ]);
      await app.inject({
        method: "PUT",
        url: "/api/profile/photo",
        headers: { ...form.headers, cookie: ctx.cookie },
        payload: form.payload,
      });
      await upload(other, [{ data: await jpeg() }]);
      expect(await filesOnDisk()).toHaveLength(4);

      const response = await app.inject({
        method: "DELETE",
        url: "/api/profile",
        headers: { cookie: ctx.cookie },
      });
      expect(response.statusCode).toBe(200);
      const left = await filesOnDisk();
      expect(left).toHaveLength(1);
      expect(left[0]).toContain(other.tripId);
    });
  });
});
