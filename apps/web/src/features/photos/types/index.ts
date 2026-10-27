import type { z } from "zod";

import type { photoSchema } from "@bordo/shared/photos";

export type Photo = z.infer<typeof photoSchema>;
