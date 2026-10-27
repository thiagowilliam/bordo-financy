"use client";

import { AuthDivider } from "@/components/molecules/auth-divider";
import { FormNotice } from "@/components/molecules/form-notice";
import { GoogleButton } from "@/components/molecules/google-button";
import { AuthCard, AuthFooterLink } from "@/components/templates/auth-card";

import { useGoogleAuth } from "../hooks/use-google-auth";
import { SignUpForm } from "./sign-up-form";

/** "Criar conta": Google first, then e-mail and password. */
export function SignUpScreen() {
  const google = useGoogleAuth({ next: "/onboarding" });

  return (
    <AuthCard
      title="Crie sua conta"
      description="Leva menos de um minuto. Sem cartão."
      banner={
        google.hasFailed ? (
          <FormNotice tone="error" compact>
            Não foi possível entrar com Google. Tente novamente.
          </FormNotice>
        ) : undefined
      }
      footer={
        <>
          <p>
            Já tem conta? <AuthFooterLink href="/entrar">Entrar</AuthFooterLink>
          </p>
          <p className="flex flex-col gap-0.5 text-[12.5px]">
            <span>Ao continuar, você concorda com os</span>
            <span>
              <AuthFooterLink href="/termos" className="text-[12.5px]">
                Termos de uso
              </AuthFooterLink>{" "}
              e a{" "}
              <AuthFooterLink href="/privacidade" className="text-[12.5px]">
                Política de privacidade
              </AuthFooterLink>
            </span>
          </p>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <GoogleButton isLoading={google.isPending} onClick={google.start} />
        <AuthDivider />
        <SignUpForm disabled={google.isPending} />
      </div>
    </AuthCard>
  );
}
