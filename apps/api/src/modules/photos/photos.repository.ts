import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { MAX_PHOTOS } from "@bordo/shared/photos";

import { DATABASE, type Database } from "../../database/database.module.js";
import { photos, trips } from "../../database/schema/index.js";

export type PhotoRow = typeof photos.$inferSelect;
export type NewPhoto = Pick<PhotoRow, "name" | "storageKey" | "width" | "height">;

/** Every query is scoped by the trip, and the trip by the user. */
@Injectable()
export class PhotosRepository {
  constructor(@Inject(DATABASE) private readonly database: Database | null) {}

  private get db(): Database {
    if (!this.database) throw new ServiceUnavailableException();
    return this.database;
  }

  async findTrip(userId: string, tripId: string) {
    const [row] = await this.db
      .select({ id: trips.id, coverPhotoId: trips.coverPhotoId })
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .limit(1);
    return row ?? null;
  }

  /** The cover first, then in upload order. */
  async list(tripId: string) {
    const rows = await this.db
      .select({ photo: photos, isCover: sql<boolean>`${photos.id} = ${trips.coverPhotoId}` })
      .from(photos)
      .innerJoin(trips, eq(trips.id, photos.tripId))
      .where(eq(photos.tripId, tripId))
      .orderBy(
        desc(sql`coalesce(${photos.id} = ${trips.coverPhotoId}, false)`),
        asc(photos.createdAt),
        asc(photos.id),
      );
    return rows.map((row) => ({ ...row.photo, isCover: row.isCover === true }));
  }

  /**
   * Adds photos to a trip, keeping the trip within `MAX_PHOTOS`. The trip row is locked while
   * counting, so two uploads at once cannot both squeeze past the limit. The first photo of a
   * trip without a cover becomes the cover.
   */
  async addMany(tripId: string, items: NewPhoto[]) {
    return this.db.transaction(async (tx) => {
      const [trip] = await tx
        .select({ coverPhotoId: trips.coverPhotoId })
        .from(trips)
        .where(eq(trips.id, tripId))
        .for("update");
      if (!trip) throw new NotFoundException();

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(photos)
        .where(eq(photos.tripId, tripId));
      if (count + items.length > MAX_PHOTOS) {
        throw new UnprocessableEntityException(`Uma viagem aceita até ${MAX_PHOTOS} fotos.`);
      }

      const created = await tx
        .insert(photos)
        .values(items.map((item) => ({ ...item, tripId })))
        .returning();
      if (!trip.coverPhotoId) {
        await tx.update(trips).set({ coverPhotoId: created[0].id }).where(eq(trips.id, tripId));
      }
      return created;
    });
  }

  async findPhoto(tripId: string, photoId: string) {
    const [row] = await this.db
      .select()
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.tripId, tripId)))
      .limit(1);
    return row ?? null;
  }

  async setCover(tripId: string, photoId: string) {
    await this.db.update(trips).set({ coverPhotoId: photoId }).where(eq(trips.id, tripId));
  }

  /**
   * Deletes a photo. If it was the cover, the oldest remaining photo takes over (or the trip is left
   * without a cover). Returns the storage key to remove, or null when the photo is not in the trip.
   */
  async remove(tripId: string, photoId: string) {
    return this.db.transaction(async (tx) => {
      const [trip] = await tx
        .select({ coverPhotoId: trips.coverPhotoId })
        .from(trips)
        .where(eq(trips.id, tripId))
        .for("update");
      const [deleted] = await tx
        .delete(photos)
        .where(and(eq(photos.id, photoId), eq(photos.tripId, tripId)))
        .returning({ storageKey: photos.storageKey });
      if (!deleted) return null;

      if (trip?.coverPhotoId === photoId) {
        const [next] = await tx
          .select({ id: photos.id })
          .from(photos)
          .where(eq(photos.tripId, tripId))
          .orderBy(asc(photos.createdAt), asc(photos.id))
          .limit(1);
        await tx
          .update(trips)
          .set({ coverPhotoId: next?.id ?? null })
          .where(eq(trips.id, tripId));
      }
      return deleted.storageKey;
    });
  }
}
