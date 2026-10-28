import { Injectable, NotFoundException } from "@nestjs/common";
import type { z } from "zod";
import type { profileStatsSchema, updateProfileSchema } from "@bordo/shared/profile";

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
  constructor(
    private readonly repository: ProfileRepository,
    private readonly auth: AuthService,
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

  async delete(user: SessionUser) {
    await this.repository.deleteUser(user.id);
    return { id: user.id };
  }
}
