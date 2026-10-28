import { createZodDto } from "nestjs-zod";
import { z } from "zod";

/** `:id` path param. Rejects anything that is not a uuid before it reaches the database. */
export class IdParamDto extends createZodDto(z.object({ id: z.uuid() })) {}
