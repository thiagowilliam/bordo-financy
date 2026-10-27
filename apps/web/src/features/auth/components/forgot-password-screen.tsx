"use client";

import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";

import { AuthCard, AuthFooterLink } from "@/components/templates/auth-card";

import { useRequestPasswordRecovery } from "../api/mutations";
import { formatCountdown, useCountdown } from "../hooks/use-countdown";
import { ForgotPasswordForm } from "./forgot-password-form";

/** Seconds before the link can be asked for again. */
const RESEND_AFTER = 45;

const backToSignIn = (
  <AuthFooterLink href="/entrar" className="inline-flex items-center gap-1.5">
    <ArrowLeft aria-hidden className="size-4" />
    Voltar para entrar
  </AuthFooterLink>
);

/** "Esqueceu sua senha?" and, after sending, "Confira seu e-mail" with a resend timer. */
export function ForgotPasswordScreen() {
  const [sentTo, setSentTo] = useState<string>();
  const countdown = useCountdown();
  const resend = useRequestPasswordRecovery();

  function handleSent(email: string) {
    setSentTo(email);
    countdown.start(RESEND_AFTER);
  }

  if (!sentTo) {
    return (
      <AuthCard
        icon={<LockKeyhole />}
        title="Esqueceu sua senha?"
        description="Informe seu e-mail e enviaremos um link para você criar uma nova senha."
        footer={backToSignIn}
      >
        <ForgotPasswordForm onSent={handleSent} />
      </AuthCard>
    );
  }

  const canResend = countdown.remaining === 0 && !resend.isPending;

  return (
    <AuthCard
      icon={<Mail />}
      title="Confira seu e-mail"
      description={`Se existir uma conta com ${sentTo}, você vai receber um link em instantes. O link vale por 1 hora.`}
      footer={backToSignIn}
    >
      <p className="flex flex-col items-center gap-0.5 text-center text-sm text-muted-foreground md:flex-row md:justify-center md:gap-1.5">
        <span>Não recebeu? Verifique o spam ou</span>
        {canResend ? (
          <button
            type="button"
            onClick={() =>
              resend.mutate({ email: sentTo }, { onSuccess: () => countdown.start(RESEND_AFTER) })
            }
            className="rounded-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            reenviar
          </button>
        ) : (
          <span aria-live="polite" className="font-semibold text-subtle-foreground">
            {resend.isPending
              ? "reenviando..."
              : `Reenviar em ${formatCountdown(countdown.remaining)}`}
          </span>
        )}
      </p>
    </AuthCard>
  );
}
