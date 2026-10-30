import {
  ApiBody,
  ApiConsumes,
  ApiProduces,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ApiSession } from "../../common/docs/api-session.decorator.js";
import {
  DeletedProfileDto,
  EmailSentDto,
  ProfileStatsDto,
  UserDto,
} from "../../common/docs/responses.js";
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
import { changeEmailSchema, updateProfileSchema } from "@bordo/shared/profile";
import { createZodDto } from "nestjs-zod";
import type { FastifyReply, FastifyRequest } from "fastify";

import { readUploads } from "../../common/http/read-uploads.js";
import { AllowMultipart } from "../auth/allow-multipart.decorator.js";

import { CurrentUser } from "../auth/current-user.decorator.js";
import { clearSessionCookie } from "../auth/session-cookie.js";
import type { SessionUser } from "../auth/session-user.js";
import { ProfileService } from "./profile.service.js";

class UpdateProfileDto extends createZodDto(updateProfileSchema) {}
class ChangeEmailDto extends createZodDto(changeEmailSchema) {}

@ApiTags("Profile")
@ApiSession()
@Controller("profile")
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @ApiOperation({ summary: "Get my profile" })
  @ApiOkResponse({ type: UserDto })
  @Get()
  get(@CurrentUser() user: SessionUser) {
    return user;
  }

  @ApiOperation({ summary: "Traveler history. The total only adds expenses in my main currency" })
  @ApiOkResponse({ type: ProfileStatsDto })
  @Get("stats")
  stats(@CurrentUser() user: SessionUser) {
    return this.profile.stats(user);
  }

  @ApiOperation({ summary: "Update my name and main currency" })
  @ApiOkResponse({ type: UserDto })
  @Patch()
  update(@CurrentUser() user: SessionUser, @Body() body: UpdateProfileDto) {
    return this.profile.update(user, body);
  }

  @ApiOperation({ summary: "Replace my profile photo" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["photo"],
      properties: {
        photo: { type: "string", format: "binary", description: "JPG, PNG or WEBP, up to 5 MB." },
      },
    },
  })
  @ApiOkResponse({ type: UserDto })
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

  @ApiOperation({ summary: "Remove my profile photo" })
  @ApiOkResponse({ type: UserDto })
  @Delete("photo")
  removePhoto(@CurrentUser() user: SessionUser) {
    return this.profile.removePhoto(user);
  }

  @ApiOperation({
    summary:
      "Ask to change my e-mail. A link goes to the new address and nothing changes until it is opened",
  })
  @ApiOkResponse({ type: EmailSentDto })
  /** Sends a confirmation link to the new address. The e-mail only changes when it is opened. */
  @Post("email-change")
  @HttpCode(200)
  changeEmail(@CurrentUser() user: SessionUser, @Body() body: ChangeEmailDto) {
    return this.profile.requestEmailChange(user, body);
  }

  @ApiOperation({
    summary:
      "E-mail me a single use link to change my password, or to add one to a Google only account",
  })
  @ApiOkResponse({ type: EmailSentDto })
  /** Same link for changing a password and for adding one to a Google-only account. */
  @Post("password-reset")
  @HttpCode(200)
  passwordReset(@CurrentUser() user: SessionUser) {
    return this.profile.requestPasswordReset(user);
  }

  @ApiOperation({ summary: "Export every expense as CSV (UTF-8 with BOM)" })
  @ApiProduces("text/csv")
  @ApiOkResponse({ description: "The CSV file.", schema: { type: "string", format: "binary" } })
  @Get("export")
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="bordo-gastos.csv"')
  @Header("Cache-Control", "no-store")
  export(@CurrentUser() user: SessionUser) {
    return this.profile.exportCsv(user);
  }

  @ApiOperation({ summary: "Delete my account and everything under it, and sign the browser out" })
  @ApiOkResponse({ type: DeletedProfileDto })
  /** Deletes the account and everything under it, and signs the browser out. */
  @Delete()
  async delete(@CurrentUser() user: SessionUser, @Res({ passthrough: true }) reply: FastifyReply) {
    const deleted = await this.profile.delete(user);
    clearSessionCookie(reply);
    return deleted;
  }
}
