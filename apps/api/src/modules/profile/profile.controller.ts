import { Body, Controller, Delete, Get, Header, HttpCode, Patch, Post, Res } from "@nestjs/common";
import { updateProfileSchema } from "@bordo/shared/profile";
import { createZodDto } from "nestjs-zod";
import type { FastifyReply } from "fastify";

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
