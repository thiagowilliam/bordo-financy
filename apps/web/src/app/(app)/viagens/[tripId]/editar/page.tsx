import { EditTripPage } from "@/features/trips";

export default async function EditarViagemPage({ params }: PageProps<"/viagens/[tripId]/editar">) {
  const { tripId } = await params;
  return <EditTripPage tripId={tripId} />;
}
