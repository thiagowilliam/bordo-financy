import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ApiSession } from "../../common/docs/api-session.decorator.js";
import { BaseCostDto, DeletedExpenseDto, ExpenseDto } from "../../common/docs/responses.js";
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from "@nestjs/common";
import {
  createExpenseSchema,
  expenseKindSchema,
  paymentMethodSchema,
} from "@bordo/shared/expenses";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { CurrentUser } from "../auth/current-user.decorator.js";
import type { SessionUser } from "../auth/session-user.js";
import { ExpensesService } from "./expenses.service.js";

class CreateExpenseDto extends createZodDto(createExpenseSchema) {}
class TripParamDto extends createZodDto(z.object({ tripId: z.uuid() })) {}
class ExpenseParamDto extends createZodDto(z.object({ tripId: z.uuid(), id: z.uuid() })) {}

/** `?categories=a,b` becomes a list of uuids. */
const categoryList = z
  .string()
  .transform((value) => value.split(",").filter(Boolean))
  .pipe(z.array(z.uuid()).max(50));

class ExpenseFiltersDto extends createZodDto(
  z.object({
    kind: expenseKindSchema.optional(),
    search: z.string().trim().max(100).optional(),
    categories: categoryList.optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    paymentMethod: paymentMethodSchema.optional(),
  }),
) {}

@ApiTags("Expenses")
@ApiSession()
@Controller("trips/:tripId")
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @ApiOperation({ summary: "List the expenses of a trip, newest first, with optional filters" })
  @ApiOkResponse({ type: [ExpenseDto] })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Get("expenses")
  list(
    @CurrentUser() user: SessionUser,
    @Param() { tripId }: TripParamDto,
    @Query() filters: ExpenseFiltersDto,
  ) {
    return this.expenses.list(user, tripId, filters);
  }

  @ApiOperation({ summary: "Create an expense (kind DAILY) or a base cost (kind BASE)" })
  @ApiCreatedResponse({ type: ExpenseDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Post("expenses")
  create(
    @CurrentUser() user: SessionUser,
    @Param() { tripId }: TripParamDto,
    @Body() body: CreateExpenseDto,
  ) {
    return this.expenses.create(user, tripId, body);
  }

  @ApiOperation({ summary: "Replace an expense" })
  @ApiOkResponse({ type: ExpenseDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Put("expenses/:id")
  update(
    @CurrentUser() user: SessionUser,
    @Param() { tripId, id }: ExpenseParamDto,
    @Body() body: CreateExpenseDto,
  ) {
    return this.expenses.update(user, tripId, id, body);
  }

  @ApiOperation({ summary: "Delete an expense" })
  @ApiOkResponse({ type: DeletedExpenseDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Delete("expenses/:id")
  @HttpCode(200)
  remove(@CurrentUser() user: SessionUser, @Param() { tripId, id }: ExpenseParamDto) {
    return this.expenses.remove(user, tripId, id);
  }

  @ApiOperation({ summary: "List the base costs (expenses of kind BASE) of a trip" })
  @ApiOkResponse({ type: [BaseCostDto] })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  /** Base costs are expenses of kind BASE; they are created and edited through `expenses`. */
  @Get("base-costs")
  listBase(@CurrentUser() user: SessionUser, @Param() { tripId }: TripParamDto) {
    return this.expenses.listBase(user, tripId);
  }
}
