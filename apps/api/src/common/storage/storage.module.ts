import { Global, Module } from "@nestjs/common";

import { ImageService } from "./image.service.js";
import { LocalStorageService } from "./local-storage.service.js";
import { MediaController } from "./media.controller.js";
import { StorageService } from "./storage.service.js";

@Global()
@Module({
  controllers: [MediaController],
  providers: [
    LocalStorageService,
    // The driver is picked here (STORAGE_DRIVER). An S3 compatible one slots in next to `local`.
    { provide: StorageService, useExisting: LocalStorageService },
    ImageService,
  ],
  exports: [StorageService, ImageService],
})
export class StorageModule {}
