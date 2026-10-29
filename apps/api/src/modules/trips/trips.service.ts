import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { z } from "zod";
import type {
  createTripSchema,
  tripDetailSchema,
  tripSchema,
  tripSummarySchema,
  updateTripSchema,
} from "@bordo/shared/trips";

import { toPhotoUrl } from "../../common/storage/photo-url.js";
import { StorageService } from "../../common/storage/storage.service.js";
import type { SessionUser } from "../auth/session-user.js";
import {
  TripsRepository,
  type BudgetChangeRow,
  type TripRow,
  type TripWithCover,
} from "./trips.repository.js";

type Trip = z.infer<typeof tripSchema>;
type TripSummary = z.infer<typeof tripSummarySchema>;
type TripDetail = z.infer<typeof tripDetailSchema>;
type CreateTrip = z.infer<typeof createTripSchema>;
type UpdateTrip = z.infer<typeof updateTripSchema>;

const toTrip = (row: TripRow, coverKey: string | null): Trip => ({
  id: row.id,
  name: row.name,
  destination: row.destination,
  startDate: row.startDate,
  endDate: row.endDate,
  budgetInCents: row.budgetCents,
  currency: row.currency,
  coverPhotoUrl: toPhotoUrl(coverKey),
});

const toBudgetChange = (row: BudgetChangeRow | null): TripDetail["lastBudgetChange"] =>
  row
    ? {
        fromInCents: row.fromCents,
        toInCents: row.toCents,
        changedAt: row.createdAt.toISOString(),
      }
    : null;

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    private readonly repository: TripsRepository,
    private readonly storage: StorageService,
  ) {}

  async list(user: SessionUser): Promise<TripSummary[]> {
    const rows = await this.repository.listWithSpent(user.id);
    return rows.map((row) => ({ ...toTrip(row, row.coverKey), spentInCents: row.spentCents }));
  }

  async get(user: SessionUser, id: string): Promise<TripDetail> {
    const row: TripWithCover | null = await this.repository.find(user.id, id);
    if (!row) throw new NotFoundException();
    const change = await this.repository.lastBudgetChange(id);
    return { ...toTrip(row, row.coverKey), lastBudgetChange: toBudgetChange(change) };
  }

  async create(user: SessionUser, input: CreateTrip): Promise<Trip> {
    const row = await this.repository.create({
      userId: user.id,
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      currency: input.currency,
      budgetCents: input.budgetInCents,
    });
    return toTrip(row, null);
  }

  /**
   * Any trip can be edited, whatever its status. Two rules the schema cannot know: the currency
   * is locked once the trip has expenses, and no daily expense may end up outside the new period (base costs are paid before the trip).
   */
  async update(user: SessionUser, id: string, input: UpdateTrip): Promise<TripDetail> {
    const current = await this.repository.find(user.id, id);
    if (!current) throw new NotFoundException();

    if (input.currency !== current.currency && (await this.repository.countExpenses(id)) > 0) {
      throw new ConflictException("A moeda não pode ser alterada depois que a viagem tem gastos");
    }
    const outside = await this.repository.countExpensesOutside(id, input.startDate, input.endDate);
    if (outside > 0) {
      throw new ConflictException(
        `${outside} ${outside === 1 ? "gasto ficaria fora" : "gastos ficariam fora"} do novo período`,
      );
    }

    const row = await this.repository.update(user.id, id, {
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      currency: input.currency,
      budgetCents: input.budgetInCents,
    });
    if (!row) throw new NotFoundException();
    const change = await this.repository.lastBudgetChange(id);
    return { ...toTrip(row, current.coverKey), lastBudgetChange: toBudgetChange(change) };
  }

  /** Expenses and photos go with the trip; the photo files are removed after the rows. */
  async remove(user: SessionUser, id: string) {
    const trip = await this.repository.find(user.id, id);
    if (!trip) throw new NotFoundException();
    const keys = await this.repository.photoKeys(id);
    if (!(await this.repository.delete(user.id, id))) throw new NotFoundException();
    await Promise.all(keys.map((key) => this.removeFile(key)));
    return { id };
  }

  /** A file that cannot be removed is logged, not fatal: the rows are already gone. */
  private async removeFile(key: string) {
    try {
      await this.storage.delete(key);
    } catch (error) {
      this.logger.error(`Could not delete ${key}: ${String(error)}`);
    }
  }
}
