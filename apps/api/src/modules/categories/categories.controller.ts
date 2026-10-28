import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import {
  createCategorySchema,
  setCategoryHiddenSchema,
  updateCategorySchema,
} from "@bordo/shared/categories";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { CurrentUser } from "../auth/current-user.decorator.js";
import type { SessionUser } from "../auth/session-user.js";
import { CategoriesService } from "./categories.service.js";

class CreateCategoryDto extends createZodDto(createCategorySchema) {}
class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
class SetHiddenDto extends createZodDto(setCategoryHiddenSchema) {}
class IdParamDto extends createZodDto(z.object({ id: z.uuid() })) {}
class DeleteQueryDto extends createZodDto(z.object({ moveTo: z.uuid().optional() })) {}

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(@CurrentUser() user: SessionUser) {
    return this.categories.list(user);
  }

  @Post()
  create(@CurrentUser() user: SessionUser, @Body() body: CreateCategoryDto) {
    return this.categories.create(user, body);
  }

  @Put(":id")
  update(
    @CurrentUser() user: SessionUser,
    @Param() { id }: IdParamDto,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categories.update(user, id, body);
  }

  @Put(":id/hidden")
  setHidden(
    @CurrentUser() user: SessionUser,
    @Param() { id }: IdParamDto,
    @Body() body: SetHiddenDto,
  ) {
    return this.categories.setHidden(user, id, body.hidden);
  }

  @Delete(":id")
  remove(
    @CurrentUser() user: SessionUser,
    @Param() { id }: IdParamDto,
    @Query() { moveTo }: DeleteQueryDto,
  ) {
    return this.categories.remove(user, id, moveTo);
  }
}
