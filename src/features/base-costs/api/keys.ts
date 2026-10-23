export const baseCostKeys = {
  all: ["base-costs"] as const,
  list: (tripId: string) => [...baseCostKeys.all, "list", tripId] as const,
};
