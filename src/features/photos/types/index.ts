import type { z } from "zod";

import type { photoSchema } from "../schemas/photo.schema";

export type Photo = z.infer<typeof photoSchema>;
