"use client";

import { useParams } from "next/navigation";

import { TripMenu, TripMenuSkeleton } from "@/components/organisms/trip-menu";

import { useTrip } from "../api/queries";
import { formatTripPeriod } from "../utils/trip-dates";
import { getTripNavItems } from "../utils/trip-nav";

function OpenTripMenu({ tripId }: { tripId: string }) {
  const { data: trip, isPending, isError } = useTrip(tripId);
  if (isPending) return <TripMenuSkeleton />;
  if (isError) return null;
  return (
    <TripMenu
      tripName={trip.name}
      period={formatTripPeriod(trip)}
      coverPhotoUrl={trip.coverPhotoUrl}
      items={getTripNavItems(tripId)}
    />
  );
}

/** Sidebar section of the trip being viewed. Renders nothing outside /viagens/[tripId]. */
export function TripSidebarMenu() {
  const { tripId } = useParams<{ tripId?: string }>();
  return tripId ? <OpenTripMenu tripId={tripId} /> : null;
}
