import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ApiSession } from "../../common/docs/api-session.decorator.js";
import {
  DeletedTripDto,
  TripDetailDto,
  TripDto,
  TripSummaryDto,
} from "../../common/docs/responses.js";
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import { createTripSchema, updateTripSchema } from "@bordo/shared/trips";
import { createZodDto } from "nestjs-zod";

import { IdParamDto } from "../../common/dto/id-param.dto.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { SessionUser } from "../auth/session-user.js";
import { TripsService } from "./trips.service.js";

class CreateTripDto extends createZodDto(createTripSchema) {}
class UpdateTripDto extends createZodDto(updateTripSchema) {}

@ApiTags("Trips")
@ApiSession()
@Controller("trips")
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @ApiOperation({ summary: "List my trips, with what was spent in each" })
  @ApiOkResponse({ type: [TripSummaryDto] })
  @Get()
  list(@CurrentUser() user: SessionUser) {
    return this.trips.list(user);
  }

  @ApiOperation({ summary: "Get a trip, with its last budget change" })
  @ApiOkResponse({ type: TripDetailDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Get(":id")
  get(@CurrentUser() user: SessionUser, @Param() { id }: IdParamDto) {
    return this.trips.get(user, id);
  }

  @ApiOperation({ summary: "Create a trip" })
  @ApiCreatedResponse({ type: TripDto })
  @Post()
  create(@CurrentUser() user: SessionUser, @Body() body: CreateTripDto) {
    return this.trips.create(user, body);
  }

  @ApiOperation({ summary: "Update a trip. A new budget is recorded as a budget change" })
  @ApiOkResponse({ type: TripDetailDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Put(":id")
  update(
    @CurrentUser() user: SessionUser,
    @Param() { id }: IdParamDto,
    @Body() body: UpdateTripDto,
  ) {
    return this.trips.update(user, id, body);
  }

  @ApiOperation({ summary: "Delete a trip and everything under it" })
  @ApiOkResponse({ type: DeletedTripDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Delete(":id")
  @HttpCode(200)
  remove(@CurrentUser() user: SessionUser, @Param() { id }: IdParamDto) {
    return this.trips.remove(user, id);
  }
}
