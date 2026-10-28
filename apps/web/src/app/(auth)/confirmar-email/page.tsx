import type { Metadata } from "next";

import { ConfirmEmailScreen } from "@/features/auth";

export const metadata: Metadata = { title: "Confirmar e-mail" };

export default async function ConfirmarEmailPage({ searchParams }: PageProps<"/confirmar-email">) {
  const { token } = await searchParams;
  return <ConfirmEmailScreen token={typeof token === "string" ? token : undefined} />;
}
