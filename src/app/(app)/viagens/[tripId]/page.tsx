import { PagePlaceholder } from "@/components/molecules/page-placeholder";

export default async function VisaoGeralPage({ params }: PageProps<"/viagens/[tripId]">) {
  const { tripId } = await params;
  return <PagePlaceholder title="Visão geral" description={`Viagem ${tripId} · em construção.`} />;
}
