import { PagePlaceholder } from "@/components/molecules/page-placeholder";

export default async function CustosBasePage({
  params,
}: PageProps<"/viagens/[tripId]/custos-base">) {
  const { tripId } = await params;
  return (
    <PagePlaceholder title="Custos de base" description={`Viagem ${tripId} · em construção.`} />
  );
}
