import { PagePlaceholder } from "@/components/molecules/page-placeholder";

export default async function DiaADiaPage({ params }: PageProps<"/viagens/[tripId]/dia-a-dia">) {
  const { tripId } = await params;
  return <PagePlaceholder title="Dia a dia" description={`Viagem ${tripId} · em construção.`} />;
}
