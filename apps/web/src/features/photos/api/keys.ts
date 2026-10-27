export const photoKeys = {
  all: ["photos"] as const,
  list: (tripId: string) => [...photoKeys.all, "list", tripId] as const,
};
