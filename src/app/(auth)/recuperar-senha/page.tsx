import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { AuthCard, AuthFooterLink } from "@/components/templates/auth-card";
import { ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecuperarSenhaPage() {
  return (
    <AuthCard
      title="Recuperar senha"
      description="Informe seu e-mail e enviaremos um link para criar uma nova senha."
      footer={
        <AuthFooterLink href="/entrar" className="inline-flex items-center gap-1.5">
          <ArrowLeft aria-hidden className="size-4" />
          Voltar para entrar
        </AuthFooterLink>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
