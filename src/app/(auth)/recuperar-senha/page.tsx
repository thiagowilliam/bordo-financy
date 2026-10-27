import type { Metadata } from "next";

import { ForgotPasswordScreen } from "@/features/auth";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecuperarSenhaPage() {
  return <ForgotPasswordScreen />;
}
