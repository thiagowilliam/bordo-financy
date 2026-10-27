"use client";

import { AuthDivider } from "@/components/molecules/auth-divider";
import { FormNotice } from "@/components/molecules/form-notice";
import { GoogleButton } from "@/components/molecules/google-button";
import { AuthCard, AuthFooterLink } from "@/components/templates/auth-card";
import { cn } from "@/lib/utils";

import { useGoogleAuth } from "../hooks/use-google-auth";
import type { GoogleError } from "../types";
import { SignInForm } from "./sign-in-form";

export type SignInScreenProps = {
  /** Where to go after signing in. Validated by the form. */
  next?: string;
  /** Set by the backend when the Google callback sends the user back here. */
  error?: GoogleError;
};

const GOOGLE_FAILED = "Não foi possível entrar com Google. Tente novamente.";
const ACCOUNT_EXISTS =
  "Este e-mail já tem uma conta no Bordo. Entre com sua senha para vincular o Google à sua conta.";

/** "Entrar": Google first, then e-mail and password. */
export function SignInScreen({ next, error }: SignInScreenProps) {
  const google = useGoogleAuth({ next });

  const banner =
    error === "account-exists" ? (
      <FormNotice tone="warning" compact>
        {ACCOUNT_EXISTS}
      </FormNotice>
    ) : error === "google" || google.hasFailed ? (
      <FormNotice tone="error" compact>
        {GOOGLE_FAILED}
      </FormNotice>
    ) : undefined;

  return (
    <AuthCard
      title="Bem-vindo de volta"
      description="Continue o diário das suas viagens."
      banner={banner}
      footer={
        <p className={cn(google.isPending && "opacity-45")}>
          Ainda não tem conta? <AuthFooterLink href="/criar-conta">Criar conta</AuthFooterLink>
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        <GoogleButton isLoading={google.isPending} onClick={google.start} />
        <div className={cn("flex flex-col gap-6", google.isPending && "opacity-45")}>
          <AuthDivider />
          <SignInForm next={next} disabled={google.isPending} />
        </div>
      </div>
    </AuthCard>
  );
}
