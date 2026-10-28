import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { createTripSchema } from "@bordo/shared/trips";
import { createZodDto } from "nestjs-zod";

import { IdParamDto } from "../../common/dto/id-param.dto.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { SessionUser } from "../auth/session-user.js";
import { TripsService } from "./trips.service.js";

class CreateTripDto extends createZodDto(createTripSchema) {}

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
}
