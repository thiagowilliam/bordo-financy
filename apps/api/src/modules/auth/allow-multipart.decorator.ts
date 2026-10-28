import { SetMetadata } from "@nestjs/common";

export const ALLOW_MULTIPART = "allowMultipart";

/** Lets a route take `multipart/form-data` (file uploads). Everything else must send JSON. */
export const AllowMultipart = () => SetMetadata(ALLOW_MULTIPART, true);
