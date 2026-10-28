import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { z } from "zod";
import type { profileStatsSchema, updateProfileSchema } from "@bordo/shared/profile";

import type { Upload } from "../../common/http/read-uploads.js";
import { ImageService } from "../../common/storage/image.service.js";
import { isOwnFile } from "../../common/storage/photo-url.js";
import { newStorageKey } from "../../common/storage/storage-key.js";
import { StorageService } from "../../common/storage/storage.service.js";
import { AuthService } from "../auth/auth.service.js";
import { toSessionUser } from "../auth/auth.repository.js";
import type { SessionUser } from "../auth/session-user.js";
import { csvRow, formatMinorUnits } from "./csv.js";
import { ProfileRepository } from "./profile.repository.js";

type ProfileStats = z.infer<typeof profileStatsSchema>;
type UpdateProfile = z.infer<typeof updateProfileSchema>;

const EXPORT_HEADER = ["Viagem", "Data", "Tipo", "Descrição", "Valor", "Moeda"];
const KIND_LABEL = { BASE: "Custo de base", DAILY: "Dia a dia" } as const;

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly repository: ProfileRepository,
    private readonly auth: AuthService,
    private readonly storage: StorageService,
    private readonly images: ImageService,
  ) {}

  async update(user: SessionUser, input: UpdateProfile) {
    const updated = await this.repository.updateUser(user.id, input);
    if (!updated) throw new NotFoundException();
    return toSessionUser(updated);
  }

  /**
   * Traveler history. The total only adds expenses made in the profile's main currency: there is
   * no exchange rate source yet, and adding euros to reais would be wrong.
   */
  async stats(user: SessionUser): Promise<ProfileStats> {
    const [totals, totalInCents] = await Promise.all([
      this.repository.tripTotals(user.id),
      this.repository.totalSpentIn(user.id, user.currency),
    ]);
    return {
      trips: totals.trips,
      daysTraveled: totals.days,
      destinations: totals.destinations,
      totalInCents,
    };
  }

  /** Checks and stores the new photo, then removes the old one if it was a file of ours. */
  async setPhoto(user: SessionUser, upload: Upload) {
    const image = await this.images.process(upload.data, ["jpeg", "png", "webp"]);
    const key = newStorageKey("avatars", user.id, image.extension);
    await this.storage.put(key, image.body, image.contentType);

    try {
      const { user: updated, previous } = await this.repository.setPhoto(user.id, key);
      if (!updated) throw new NotFoundException();
      if (isOwnFile(previous)) await this.removeFile(previous);
      return toSessionUser(updated);
    } catch (error) {
      await this.removeFile(key);
      throw error;
    }
  }

  async removePhoto(user: SessionUser) {
    const { user: updated, previous } = await this.repository.setPhoto(user.id, null);
    if (!updated) throw new NotFoundException();
    if (isOwnFile(previous)) await this.removeFile(previous);
    return toSessionUser(updated);
  }

  requestEmailChange(user: SessionUser, input: { email: string }) {
    return this.auth.requestEmailChange(user, input);
  }

  requestPasswordReset(user: SessionUser) {
    return this.auth.requestPasswordReset(user);
  }

  async exportCsv(user: SessionUser) {
    const rows = await this.repository.exportRows(user.id);
    const lines = rows.map((row) =>
      csvRow([
        row.trip,
        row.date,
        KIND_LABEL[row.kind],
        row.description,
        formatMinorUnits(row.amountCents, row.currency),
        row.currency,
      ]),
    );
    // BOM so Excel reads the accents as UTF-8.
    return `﻿${[csvRow(EXPORT_HEADER), ...lines].join("\n")}\n`;
  }

  /** Deletes the account, then the files that belonged to it (profile and trip photos). */
  async delete(user: SessionUser) {
    const keys = (await this.repository.storedFileKeys(user.id)).filter(isOwnFile);
    await this.repository.deleteUser(user.id);
    await Promise.all(keys.map((key) => this.removeFile(key)));
    return { id: user.id };
  }

  /** A file that cannot be removed is logged, not fatal: the data is already gone. */
  private async removeFile(key: string) {
    try {
      await this.storage.delete(key);
    } catch (error) {
      this.logger.error(`Could not delete ${key}: ${String(error)}`);
    }
  }
}
