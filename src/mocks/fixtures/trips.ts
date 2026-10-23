import type { Trip } from "@/features/trips";

export const LISBON_TRIP_ID = "trip-lisboa-sintra";

const cover = (photo: string) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=800&q=80`;

/** Dates are laid out around late October 2026, like the Pencil design. */
export const tripsFixture: Trip[] = [
  {
    id: LISBON_TRIP_ID,
    name: "Lisboa & Sintra",
    destination: "Portugal",
    startDate: "2026-10-12",
    endDate: "2026-10-26",
    budgetInCents: 500000,
    currency: "EUR",
    coverPhotoUrl: cover("photo-1541322841511-e0aed2019f2a"),
  },
  {
    id: "trip-kyoto-osaka",
    name: "Kyoto & Osaka",
    destination: "Japão",
    startDate: "2027-03-04",
    endDate: "2027-03-18",
    budgetInCents: 640000,
    currency: "JPY",
    coverPhotoUrl: cover("photo-1583648008754-6dcfd0e1043f"),
  },
  {
    id: "trip-patagonia",
    name: "Patagônia",
    destination: "Chile e Argentina",
    startDate: "2027-01-10",
    endDate: "2027-01-24",
    budgetInCents: 480000,
    currency: "USD",
    coverPhotoUrl: cover("photo-1667759046743-75425a9a1688"),
  },
  {
    id: "trip-costa-amalfitana",
    name: "Costa Amalfitana",
    destination: "Itália",
    startDate: "2026-06-02",
    endDate: "2026-06-12",
    budgetInCents: 480000,
    currency: "EUR",
    coverPhotoUrl: cover("photo-1685725270982-ab11c47207a7"),
  },
  {
    id: "trip-bali",
    name: "Bali",
    destination: "Indonésia",
    startDate: "2026-02-08",
    endDate: "2026-02-22",
    budgetInCents: 1750000,
    currency: "BRL",
    coverPhotoUrl: cover("photo-1682321297054-519c8a76756b"),
  },
];
