import { PagePlaceholder } from "@/components/molecules/page-placeholder";

export default async function FotosPage({ params }: PageProps<"/viagens/[tripId]/fotos">) {
  const { tripId } = await params;
  return <PagePlaceholder title="Fotos" description={`Viagem ${tripId} · em construção.`} />;
}
