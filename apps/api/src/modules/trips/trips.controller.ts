import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import { createTripSchema, updateTripSchema } from "@bordo/shared/trips";
import { createZodDto } from "nestjs-zod";

import { IdParamDto } from "../../common/dto/id-param.dto.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { SessionUser } from "../auth/session-user.js";
import { TripsService } from "./trips.service.js";

class CreateTripDto extends createZodDto(createTripSchema) {}
class UpdateTripDto extends createZodDto(updateTripSchema) {}

@Controller("trips")
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Get()
  list(@CurrentUser() user: SessionUser) {
    return this.trips.list(user);
  }

  @Get(":id")
  get(@CurrentUser() user: SessionUser, @Param() { id }: IdParamDto) {
    return this.trips.get(user, id);
  }

  @Post()
  create(@CurrentUser() user: SessionUser, @Body() body: CreateTripDto) {
    return this.trips.create(user, body);
  }

  @Put(":id")
  update(
    @CurrentUser() user: SessionUser,
    @Param() { id }: IdParamDto,
    @Body() body: UpdateTripDto,
  ) {
    return this.trips.update(user, id, body);
  }

  @Delete(":id")
  @HttpCode(200)
  remove(@CurrentUser() user: SessionUser, @Param() { id }: IdParamDto) {
    return this.trips.remove(user, id);
  }
}
