import type { Metadata } from "next";

import { SignUpScreen } from "@/features/auth";

export const metadata: Metadata = { title: "Criar conta" };

export default function CriarContaPage() {
  return <SignUpScreen />;
}
