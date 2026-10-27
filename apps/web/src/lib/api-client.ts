import type { z } from "zod";

import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

/** Fetches JSON from the API and validates the response with a Zod schema. */
export async function apiFetch<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  { body, headers, ...init }: RequestOptions = {},
): Promise<z.infer<TSchema>> {
  // FormData sets its own multipart Content-Type (with the boundary), so it must not be forced.
  const isFormData = body instanceof FormData;
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: isFormData ? headers : { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(response.status, response.statusText);
  return schema.parse(await response.json());
}
