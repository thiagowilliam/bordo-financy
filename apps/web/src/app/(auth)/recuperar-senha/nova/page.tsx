import type { Metadata } from "next";

import { ResetPasswordScreen } from "@/features/auth";

export const metadata: Metadata = { title: "Nova senha" };

export default async function NovaSenhaPage({ searchParams }: PageProps<"/recuperar-senha/nova">) {
  const { token } = await searchParams;
  return <ResetPasswordScreen token={typeof token === "string" ? token : undefined} />;
}
