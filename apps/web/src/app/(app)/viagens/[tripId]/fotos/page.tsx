import { PhotosScreen } from "@/features/photos";

export default async function FotosPage({ params }: PageProps<"/viagens/[tripId]/fotos">) {
  const { tripId } = await params;
  return <PhotosScreen tripId={tripId} />;
}
