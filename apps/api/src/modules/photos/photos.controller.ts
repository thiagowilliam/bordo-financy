import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { MAX_PHOTO_BYTES, MAX_PHOTOS } from "@bordo/shared/photos";
import { createZodDto } from "nestjs-zod";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import { readUploads } from "../../common/http/read-uploads.js";
import { AllowMultipart } from "../auth/allow-multipart.decorator.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { SessionUser } from "../auth/session-user.js";
import { PhotosService } from "./photos.service.js";

class TripParamDto extends createZodDto(z.object({ tripId: z.uuid() })) {}
class PhotoParamDto extends createZodDto(z.object({ tripId: z.uuid(), photoId: z.uuid() })) {}
class SetCoverDto extends createZodDto(z.object({ photoId: z.uuid() })) {}

@Controller("trips/:tripId")
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  /** The cover first. */
  @Get("photos")
  list(@CurrentUser() user: SessionUser, @Param() { tripId }: TripParamDto) {
    return this.photos.list(user, tripId);
  }

  /** `multipart/form-data`, the images under the field `files`. */
  @Post("photos")
  @AllowMultipart()
  async upload(
    @CurrentUser() user: SessionUser,
    @Param() { tripId }: TripParamDto,
    @Req() request: FastifyRequest,
  ) {
    const uploads = await readUploads(request, "files", {
      maxFiles: MAX_PHOTOS,
      maxBytes: MAX_PHOTO_BYTES,
    });
    return this.photos.upload(user, tripId, uploads);
  }

  @Put("cover")
  setCover(
    @CurrentUser() user: SessionUser,
    @Param() { tripId }: TripParamDto,
    @Body() { photoId }: SetCoverDto,
  ) {
    return this.photos.setCover(user, tripId, photoId);
  }

  @Delete("photos/:photoId")
  remove(@CurrentUser() user: SessionUser, @Param() { tripId, photoId }: PhotoParamDto) {
    return this.photos.remove(user, tripId, photoId);
  }
}
