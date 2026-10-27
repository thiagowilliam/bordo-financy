export const tripKeys = {
  all: ["trips"] as const,
  lists: () => [...tripKeys.all, "list"] as const,
  detail: (tripId: string) => [...tripKeys.all, "detail", tripId] as const,
};
