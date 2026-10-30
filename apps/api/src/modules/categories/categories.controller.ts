import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ApiSession } from "../../common/docs/api-session.decorator.js";
import { CategoryDto, DeletedCategoryDto } from "../../common/docs/responses.js";
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import {
  createCategorySchema,
  setCategoryHiddenSchema,
  updateCategorySchema,
} from "@bordo/shared/categories";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { IdParamDto } from "../../common/dto/id-param.dto.js";

import { CurrentUser } from "../auth/current-user.decorator.js";
import type { SessionUser } from "../auth/session-user.js";
import { CategoriesService } from "./categories.service.js";

class CreateCategoryDto extends createZodDto(createCategorySchema) {}
class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
class SetHiddenDto extends createZodDto(setCategoryHiddenSchema) {}
class DeleteQueryDto extends createZodDto(z.object({ moveTo: z.uuid().optional() })) {}

@ApiTags("Categories")
@ApiSession()
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @ApiOperation({ summary: "List my categories" })
  @ApiOkResponse({ type: [CategoryDto] })
  @Get()
  list(@CurrentUser() user: SessionUser) {
    return this.categories.list(user);
  }

  @ApiOperation({ summary: "Create a category" })
  @ApiCreatedResponse({ type: CategoryDto })
  @Post()
  create(@CurrentUser() user: SessionUser, @Body() body: CreateCategoryDto) {
    return this.categories.create(user, body);
  }

  @ApiOperation({ summary: "Rename or restyle a category" })
  @ApiOkResponse({ type: CategoryDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Put(":id")
  update(
    @CurrentUser() user: SessionUser,
    @Param() { id }: IdParamDto,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categories.update(user, id, body);
  }

  @ApiOperation({ summary: "Hide or show a category in the pickers" })
  @ApiOkResponse({ type: CategoryDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Put(":id/hidden")
  setHidden(
    @CurrentUser() user: SessionUser,
    @Param() { id }: IdParamDto,
    @Body() body: SetHiddenDto,
  ) {
    return this.categories.setHidden(user, id, body.hidden);
  }

  @ApiOperation({ summary: "Delete a category. Its expenses move to `moveTo` when given" })
  @ApiOkResponse({ type: DeletedCategoryDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Delete(":id")
  remove(
    @CurrentUser() user: SessionUser,
    @Param() { id }: IdParamDto,
    @Query() { moveTo }: DeleteQueryDto,
  ) {
    return this.categories.remove(user, id, moveTo);
  }
}
