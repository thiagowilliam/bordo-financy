import { LISBON_TRIP_ID, tripsFixture } from "./trips";

export type PhotoRecord = { id: string; tripId: string; name: string; url: string };

const gallery = (photo: string) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&q=80`;

/** The cover of every trip is also a photo of it, so "Fotos" always has the cover first. */
const coverPhotosFixture: PhotoRecord[] = tripsFixture.flatMap((trip) =>
  trip.coverPhotoUrl
    ? [
        {
          id: `photo-${trip.id}-cover`,
          tripId: trip.id,
          name: `${trip.name} - capa.jpg`,
          url: trip.coverPhotoUrl,
        },
      ]
    : [],
);

/** Five more photos of the Lisboa trip, so the gallery has the six of the design. */
const lisbonExtraPhotos: PhotoRecord[] = [
  ["photo-1734812788137-3a9941711a6c", "Bondinho em Alfama"],
  ["photo-1570556979680-d06d000d4ceb", "Praça do Comércio"],
  ["photo-1693772868211-3d8728176449", "Torre de Belém"],
  ["photo-1622984119798-d39d18c08f4c", "Sintra"],
  ["photo-1729553232361-7030371fcdf6", "Miradouro ao entardecer"],
].map(([photo, name], index) => ({
  id: `photo-${LISBON_TRIP_ID}-${index + 2}`,
  tripId: LISBON_TRIP_ID,
  name: `${name}.jpg`,
  url: gallery(photo),
}));

export const photosFixture: PhotoRecord[] = [...coverPhotosFixture, ...lisbonExtraPhotos];
