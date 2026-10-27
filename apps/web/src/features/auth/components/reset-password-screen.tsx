"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Clock3, KeyRound, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormField } from "@/components/molecules/form-field";
import { PasswordField } from "@/components/molecules/password-field";
import { PasswordStrength } from "@/components/molecules/password-strength";
import { AuthCard, authSubmitClassName } from "@/components/templates/auth-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useResetPassword } from "../api/mutations";
import { useResetToken } from "../api/queries";
import { newPasswordSchema } from "@bordo/shared/auth";
import type { NewPasswordInput } from "../types";

export type ResetPasswordScreenProps = {
  /** Token of the recovery link (`?token=`). Missing counts as an expired link. */
  token?: string;
};

function ExpiredLink() {
  return (
    <AuthCard
      icon={<Clock3 />}
      iconTone="warning"
      title="Este link expirou"
      description="Links de recuperação valem por 1 hora e só podem ser usados uma vez."
    >
      <Button asChild variant="cta" size="lg" className={authSubmitClassName}>
        <Link href="/recuperar-senha">
          <Send aria-hidden />
          Enviar novo link
        </Link>
      </Button>
    </AuthCard>
  );
}

function PasswordUpdated() {
  return (
    <AuthCard
      icon={<Check />}
      iconTone="success"
      title="Senha atualizada"
      description="Sua nova senha já está valendo. Por segurança, você saiu dos outros dispositivos."
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

function NewPasswordForm({ token, email }: { token: string; email: string }) {
  const reset = useResetPassword();
  const [formError, setFormError] = useState<string>();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, touchedFields },
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" });

  if (done) return <PasswordUpdated />;

  const onSubmit = handleSubmit(({ password: value }) => {
    setFormError(undefined);
    reset.mutate(
      { token, password: value },
      {
        onSuccess: () => setDone(true),
        onError: () => setFormError("Não foi possível salvar a nova senha. Tente de novo."),
      },
    );
  });

  return (
    <AuthCard icon={<KeyRound />} title="Crie uma nova senha" description={`Para a conta ${email}`}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div className={cn("flex flex-col gap-5", reset.isPending && "opacity-60")}>
          <div className="flex flex-col gap-3">
            <FormField label="Nova senha">
              {(field) => (
                <PasswordField
                  placeholder="Crie uma senha forte"
                  autoComplete="new-password"
                  {...register("password", { deps: ["confirmPassword"] })}
                  {...field}
                />
              )}
            </FormField>
            <PasswordStrength password={password} />
          </div>
          <FormField
            label="Confirmar nova senha"
            error={touchedFields.confirmPassword ? errors.confirmPassword?.message : undefined}
          >
            {(field) => (
              <PasswordField
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                {...register("confirmPassword")}
                {...field}
              />
            )}
          </FormField>
          {formError ? (
            <p role="alert" className="text-[13px] font-semibold text-destructive-ink">
              {formError}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          variant="cta"
          size="lg"
          disabled={!isValid || reset.isPending}
          className={authSubmitClassName}
        >
          {reset.isPending ? (
            <>
              <Loader2 aria-hidden className="animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar nova senha"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}

/** "Crie uma nova senha": opened from the e-mail link. Checks the link before showing the form. */
export function ResetPasswordScreen({ token }: ResetPasswordScreenProps) {
  const link = useResetToken(token ?? "");

  if (!token || link.isError) return <ExpiredLink />;

  if (link.isPending) {
    return (
      <AuthCard icon={<KeyRound />} title="Crie uma nova senha">
        <div
          role="status"
          aria-busy="true"
          aria-label="Verificando o link"
          className="flex flex-col gap-4"
        >
          <Skeleton className="h-18 rounded-xl" />
          <Skeleton className="h-18 rounded-xl" />
        </div>
      </AuthCard>
    );
  }

  return <NewPasswordForm token={token} email={link.data.email} />;
}
