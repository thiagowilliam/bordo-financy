import { TripOverview } from "@/features/trips";

export default async function VisaoGeralPage({ params }: PageProps<"/viagens/[tripId]">) {
  const { tripId } = await params;
  return <TripOverview tripId={tripId} />;
}
