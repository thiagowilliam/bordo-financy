import type { Metadata } from "next";

import { AuthCard, AuthFooterLink } from "@/components/templates/auth-card";
import { SignInForm } from "@/features/auth";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const { next } = await searchParams;
  return (
    <AuthCard
      title="Entrar no Bordo"
      description="Continue o diário das suas viagens."
      footer={
        <>
          Ainda não tem conta? <AuthFooterLink href="/criar-conta">Criar conta</AuthFooterLink>
        </>
      }
    >
      <SignInForm next={typeof next === "string" ? next : undefined} />
    </AuthCard>
  );
}
