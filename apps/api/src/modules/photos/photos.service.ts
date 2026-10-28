import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { z } from "zod";
import type { photoSchema } from "@bordo/shared/photos";

import type { Upload } from "../../common/http/read-uploads.js";
import { ImageService } from "../../common/storage/image.service.js";
import { toPhotoUrl } from "../../common/storage/photo-url.js";
import { newStorageKey } from "../../common/storage/storage-key.js";
import { StorageService } from "../../common/storage/storage.service.js";
import type { SessionUser } from "../auth/session-user.js";
import { PhotosRepository, type PhotoRow } from "./photos.repository.js";

type Photo = z.infer<typeof photoSchema>;

const toPhoto = (row: PhotoRow, isCover: boolean): Photo => ({
  id: row.id,
  tripId: row.tripId,
  name: row.name,
  url: toPhotoUrl(row.storageKey) ?? row.storageKey,
  isCover,
});

@Injectable()
export class PhotosService {
  private readonly logger = new Logger(PhotosService.name);

  constructor(
    private readonly repository: PhotosRepository,
    private readonly storage: StorageService,
    private readonly images: ImageService,
  ) {}

  async list(user: SessionUser, tripId: string) {
    await this.requireTrip(user, tripId);
    return (await this.repository.list(tripId)).map((row) => toPhoto(row, row.isCover));
  }

  /**
   * Every file is checked and processed before anything is stored, so one bad file rejects the
   * whole batch. If saving the rows fails after the files were written, the files are removed.
   */
  async upload(user: SessionUser, tripId: string, uploads: Upload[]) {
    const trip = await this.requireTrip(user, tripId);

    const processed = [];
    for (const upload of uploads) {
      processed.push({ upload, image: await this.images.process(upload.data, ["jpeg", "png"]) });
    }
    const items = processed.map(({ upload, image }) => ({
      name: upload.name,
      storageKey: newStorageKey("trips", tripId, image.extension),
      width: image.width,
      height: image.height,
      image,
    }));

    for (const item of items)
      await this.storage.put(item.storageKey, item.image.body, item.image.contentType);
    try {
      const created = await this.repository.addMany(
        tripId,
        items.map(({ name, storageKey, width, height }) => ({ name, storageKey, width, height })),
      );
      const coverId = trip.coverPhotoId ?? created[0].id;
      return created.map((row) => toPhoto(row, row.id === coverId));
    } catch (error) {
      await Promise.all(items.map((item) => this.removeFile(item.storageKey)));
      throw error;
    }
  }

  async setCover(user: SessionUser, tripId: string, photoId: string) {
    await this.requireTrip(user, tripId);
    const photo = await this.repository.findPhoto(tripId, photoId);
    if (!photo) throw new NotFoundException();
    await this.repository.setCover(tripId, photoId);
    return toPhoto(photo, true);
  }

  async remove(user: SessionUser, tripId: string, photoId: string) {
    await this.requireTrip(user, tripId);
    const storageKey = await this.repository.remove(tripId, photoId);
    if (storageKey === null) throw new NotFoundException();
    await this.removeFile(storageKey);
    return { id: photoId };
  }

  private async requireTrip(user: SessionUser, tripId: string) {
    const trip = await this.repository.findTrip(user.id, tripId);
    if (!trip) throw new NotFoundException();
    return trip;
  }

  /** A file that cannot be removed is logged, not fatal: the row is already gone. */
  private async removeFile(key: string) {
    try {
      await this.storage.delete(key);
    } catch (error) {
      this.logger.error(`Could not delete ${key}: ${String(error)}`);
    }
  }
}
