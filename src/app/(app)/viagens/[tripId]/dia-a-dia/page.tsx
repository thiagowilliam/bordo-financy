import { DailyList } from "@/features/expenses";

export default async function DiaADiaPage({ params }: PageProps<"/viagens/[tripId]/dia-a-dia">) {
  const { tripId } = await params;
  return <DailyList tripId={tripId} />;
}
