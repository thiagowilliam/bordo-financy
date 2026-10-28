import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import type { z } from "zod";
import type { baseCostSchema } from "@bordo/shared/base-costs";
import type { createExpenseSchema, expenseSchema } from "@bordo/shared/expenses";

import type { SessionUser } from "../auth/session-user.js";
import {
  ExpensesRepository,
  type ExpenseFilters,
  type ExpenseRow,
  type ExpenseValues,
} from "./expenses.repository.js";

type Expense = z.infer<typeof expenseSchema>;
type BaseCost = z.infer<typeof baseCostSchema>;
type CreateExpense = z.infer<typeof createExpenseSchema>;

const toExpense = (row: ExpenseRow): Expense => ({
  id: row.id,
  tripId: row.tripId,
  kind: row.kind,
  categoryId: row.categoryId,
  paymentMethod: row.paymentMethod,
  amountInCents: row.amountCents,
  currency: row.currency,
  date: row.spentAt,
  description: row.description,
});

@Injectable()
export class ExpensesService {
  constructor(private readonly repository: ExpensesRepository) {}

  async list(user: SessionUser, tripId: string, filters: ExpenseFilters) {
    await this.requireTrip(user, tripId);
    return (await this.repository.list(tripId, filters)).map(toExpense);
  }

  async listBase(user: SessionUser, tripId: string) {
    await this.requireTrip(user, tripId);
    const rows = await this.repository.listBase(tripId);
    return rows.map((row) => toExpense(row) as BaseCost);
  }

  async create(user: SessionUser, tripId: string, input: CreateExpense) {
    const trip = await this.requireTrip(user, tripId);
    await this.validate(user, trip.currency, input, undefined);
    return toExpense(await this.repository.create(tripId, this.values(input)));
  }

  async update(user: SessionUser, tripId: string, id: string, input: CreateExpense) {
    const trip = await this.requireTrip(user, tripId);
    const current = await this.repository.find(tripId, id);
    if (!current) throw new NotFoundException();
    await this.validate(user, trip.currency, input, current.categoryId);
    const row = await this.repository.update(tripId, id, this.values(input));
    if (!row) throw new NotFoundException();
    return toExpense(row);
  }

  async remove(user: SessionUser, tripId: string, id: string) {
    await this.requireTrip(user, tripId);
    if (!(await this.repository.delete(tripId, id))) throw new NotFoundException();
    return { id };
  }

  /** A trip of someone else looks the same as a trip that does not exist. */
  private async requireTrip(user: SessionUser, tripId: string) {
    const trip = await this.repository.findTrip(user.id, tripId);
    if (!trip) throw new NotFoundException();
    return trip;
  }

  /**
   * Rules the shared schema cannot know: the expense is in the trip's currency, and its category is
   * the user's, of the same kind, and not hidden. Hidden categories are not offered for new
   * expenses, but an expense that already has one keeps it when edited.
   */
  private async validate(
    user: SessionUser,
    tripCurrency: string,
    input: CreateExpense,
    currentCategoryId: string | undefined,
  ) {
    if (input.currency !== tripCurrency) {
      throw new UnprocessableEntityException("A moeda do gasto deve ser a mesma da viagem");
    }
    const category = await this.repository.findCategory(user.id, input.categoryId);
    if (!category) throw new UnprocessableEntityException("Categoria inválida");
    if (category.kind !== input.kind) {
      throw new UnprocessableEntityException("A categoria não é do tipo deste lançamento");
    }
    if (category.hidden && category.id !== currentCategoryId) {
      throw new UnprocessableEntityException("Esta categoria está oculta");
    }
  }

  /** The trip comes from the path and the owner from the session, never from the body. */
  private values(input: CreateExpense): ExpenseValues {
    return {
      kind: input.kind,
      categoryId: input.categoryId,
      paymentMethod: input.paymentMethod,
      amountCents: input.amountInCents,
      currency: input.currency,
      spentAt: input.date,
      description: input.description,
    };
  }
}
