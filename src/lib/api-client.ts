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
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(response.status, response.statusText);
  return schema.parse(await response.json());
}
