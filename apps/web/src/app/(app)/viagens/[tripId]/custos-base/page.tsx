import { BaseCostsList } from "@/features/base-costs";

export default async function CustosBasePage({
  params,
}: PageProps<"/viagens/[tripId]/custos-base">) {
  const { tripId } = await params;
  return <BaseCostsList tripId={tripId} />;
}
