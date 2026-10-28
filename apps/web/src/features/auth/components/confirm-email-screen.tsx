"use client";

import { ArrowRight, Check, Clock3, Loader2, Mail, User } from "lucide-react";
import Link from "next/link";

import { FormNotice } from "@/components/molecules/form-notice";
import { AuthCard, authSubmitClassName } from "@/components/templates/auth-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";

import { useConfirmEmailChange } from "../api/mutations";
import { useEmailChangeToken } from "../api/queries";

export type ConfirmEmailScreenProps = {
  /** Token of the confirmation link (`?token=`). Missing counts as an expired link. */
  token?: string;
};

function ExpiredLink() {
  return (
    <AuthCard
      icon={<Clock3 />}
      iconTone="warning"
      title="Este link expirou"
      description="Links de troca de e-mail valem por 1 hora e só podem ser usados uma vez. Peça uma nova troca no seu perfil."
    >
      <Button asChild variant="cta" size="lg" className={authSubmitClassName}>
        <Link href="/perfil">
          <User aria-hidden />
          Ir para o perfil
        </Link>
      </Button>
    </AuthCard>
  );
}

function EmailUpdated() {
  return (
    <AuthCard
      icon={<Check />}
      iconTone="success"
      title="E-mail atualizado"
      description="Seu novo e-mail já está valendo. Por segurança, você saiu de todos os dispositivos."
    >
      <Button asChild variant="cta" size="lg" className={authSubmitClassName}>
        <Link href="/entrar">
          <ArrowRight aria-hidden />
          Entrar no Bordo
        </Link>
      </Button>
    </AuthCard>
  );
}

function ConfirmEmailPrompt({ token, email }: { token: string; email: string }) {
  const confirm = useConfirmEmailChange();

  if (confirm.isSuccess) return <EmailUpdated />;

  const error = confirm.error;
  const message = error
    ? error instanceof ApiError && error.status === 409
      ? "Este e-mail já está em uso por outra conta."
      : "Não foi possível confirmar agora. Tente novamente."
    : undefined;

  return (
    <AuthCard
      icon={<Mail />}
      title="Confirmar novo e-mail"
      description={
        <>
          O e-mail da sua conta passará a ser{" "}
          <strong className="font-semibold text-foreground">{email}</strong>.
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <p className="text-[13px] text-muted-foreground">
          Depois de confirmar, você vai precisar entrar de novo com o novo e-mail.
        </p>
        {message ? (
          <FormNotice tone="error" compact>
            {message}
          </FormNotice>
        ) : null}
        <Button
          type="button"
          variant="cta"
          size="lg"
          disabled={confirm.isPending}
          onClick={() => confirm.mutate(token)}
          className={authSubmitClassName}
        >
          {confirm.isPending ? (
            <>
              <Loader2 aria-hidden className="animate-spin" />
              Confirmando...
            </>
          ) : (
            "Confirmar novo e-mail"
          )}
        </Button>
      </div>
    </AuthCard>
  );
}

/** "Confirmar novo e-mail": opened from the e-mail link. Checks the link before offering the button. */
export function ConfirmEmailScreen({ token }: ConfirmEmailScreenProps) {
  const link = useEmailChangeToken(token ?? "");

  if (!token || link.isError) return <ExpiredLink />;

  if (link.isPending) {
    return (
      <AuthCard icon={<Mail />} title="Confirmar novo e-mail">
        <div
          role="status"
          aria-busy="true"
          aria-label="Verificando o link"
          className="flex flex-col gap-4"
        >
          <Skeleton className="h-18 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </AuthCard>
    );
  }

  return <ConfirmEmailPrompt token={token} email={link.data.email} />;
}
