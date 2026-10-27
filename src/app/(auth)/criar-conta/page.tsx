import type { Metadata } from "next";

import { AuthCard, AuthFooterLink } from "@/components/templates/auth-card";
import { SignUpForm } from "@/features/auth";

export const metadata: Metadata = { title: "Criar conta" };

export default function CriarContaPage() {
  return (
    <AuthCard
      title="Criar conta"
      description="Leva menos de um minuto. Sem cartão."
      footer={
        <>
          Já tem conta? <AuthFooterLink href="/entrar">Entrar</AuthFooterLink>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
