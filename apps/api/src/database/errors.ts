const codeOf = (error: unknown): string | undefined =>
  (error as { code?: string } | null)?.code ??
  (error as { cause?: { code?: string } } | null)?.cause?.code;

export const isUniqueViolation = (error: unknown) => codeOf(error) === "23505";
export const isForeignKeyViolation = (error: unknown) => codeOf(error) === "23503";
