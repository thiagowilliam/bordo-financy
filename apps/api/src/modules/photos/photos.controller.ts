import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ApiSession } from "../../common/docs/api-session.decorator.js";
import { DeletedPhotoDto, PhotoDto } from "../../common/docs/responses.js";
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

@ApiTags("Photos")
@ApiSession()
@Controller("trips/:tripId")
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @ApiOperation({ summary: "List the photos of a trip, the cover first" })
  @ApiOkResponse({ type: [PhotoDto] })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  /** The cover first. */
  @Get("photos")
  list(@CurrentUser() user: SessionUser, @Param() { tripId }: TripParamDto) {
    return this.photos.list(user, tripId);
  }

  @ApiOperation({ summary: "Upload photos. One bad file rejects the whole batch" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["files"],
      properties: {
        files: {
          type: "array",
          items: { type: "string", format: "binary" },
          description: "JPG, PNG or WEBP images.",
        },
      },
    },
  })
  @ApiCreatedResponse({ type: [PhotoDto] })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
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

  @ApiOperation({ summary: "Set the cover photo of a trip" })
  @ApiOkResponse({ type: PhotoDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Put("cover")
  setCover(
    @CurrentUser() user: SessionUser,
    @Param() { tripId }: TripParamDto,
    @Body() { photoId }: SetCoverDto,
  ) {
    return this.photos.setCover(user, tripId, photoId);
  }

  @ApiOperation({ summary: "Delete a photo and its file" })
  @ApiOkResponse({ type: DeletedPhotoDto })
  @ApiNotFoundResponse({ description: "Not found, or it belongs to someone else." })
  @Delete("photos/:photoId")
  remove(@CurrentUser() user: SessionUser, @Param() { tripId, photoId }: PhotoParamDto) {
    return this.photos.remove(user, tripId, photoId);
  }
}
