export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
  stats: () => [...profileKeys.all, "stats"] as const,
};
