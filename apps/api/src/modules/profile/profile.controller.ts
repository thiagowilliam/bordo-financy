import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Patch,
  Post,
  Put,
  Req,
  Res,
} from "@nestjs/common";
import { AVATAR_MAX_BYTES } from "@bordo/shared/photos";
import { updateProfileSchema } from "@bordo/shared/profile";
import { createZodDto } from "nestjs-zod";
import type { FastifyReply, FastifyRequest } from "fastify";

import { readUploads } from "../../common/http/read-uploads.js";
import { AllowMultipart } from "../auth/allow-multipart.decorator.js";

import { CurrentUser } from "../auth/current-user.decorator.js";
import { clearSessionCookie } from "../auth/session-cookie.js";
import type { SessionUser } from "../auth/session-user.js";
import { ProfileService } from "./profile.service.js";

class UpdateProfileDto extends createZodDto(updateProfileSchema) {}

@Controller("profile")
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: SessionUser) {
    return user;
  }

  @Get("stats")
  stats(@CurrentUser() user: SessionUser) {
    return this.profile.stats(user);
  }

  @Patch()
  update(@CurrentUser() user: SessionUser, @Body() body: UpdateProfileDto) {
    return this.profile.update(user, body);
  }

  /** `multipart/form-data`, one image (JPG, PNG or WEBP, up to 5 MB) under the field `photo`. */
  @Put("photo")
  @AllowMultipart()
  async setPhoto(@CurrentUser() user: SessionUser, @Req() request: FastifyRequest) {
    const [upload] = await readUploads(request, "photo", {
      maxFiles: 1,
      maxBytes: AVATAR_MAX_BYTES,
    });
    return this.profile.setPhoto(user, upload);
  }

  @Delete("photo")
  removePhoto(@CurrentUser() user: SessionUser) {
    return this.profile.removePhoto(user);
  }

  /** Same link for changing a password and for adding one to a Google-only account. */
  @Post("password-reset")
  @HttpCode(200)
  passwordReset(@CurrentUser() user: SessionUser) {
    return this.profile.requestPasswordReset(user);
  }

  @Get("export")
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="bordo-gastos.csv"')
  @Header("Cache-Control", "no-store")
  export(@CurrentUser() user: SessionUser) {
    return this.profile.exportCsv(user);
  }

  /** Deletes the account and everything under it, and signs the browser out. */
  @Delete()
  async delete(@CurrentUser() user: SessionUser, @Res({ passthrough: true }) reply: FastifyReply) {
    const deleted = await this.profile.delete(user);
    clearSessionCookie(reply);
    return deleted;
  }
}
