"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { authSubmitClassName } from "@/components/templates/auth-card";
import { Button } from "@/components/ui/button";

import { useRequestPasswordRecovery } from "../api/mutations";
import { forgotPasswordSchema } from "@bordo/shared/auth";
import type { ForgotPasswordInput } from "../types";

export type ForgotPasswordFormProps = {
  /** Called with the typed e-mail once the link was requested. */
  onSent: (email: string) => void;
};

/** Asks for the e-mail and requests the recovery link. */
export function ForgotPasswordForm({ onSent }: ForgotPasswordFormProps) {
  const recovery = useRequestPasswordRecovery();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit((values) => {
    setFormError(undefined);
    recovery.mutate(values, {
      onSuccess: () => onSent(values.email),
      onError: () => setFormError("Não foi possível enviar o link. Tente de novo."),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <FormField label="E-mail" error={errors.email?.message}>
          {(control) => (
            <TextField
              type="email"
              icon={<Mail />}
              placeholder="voce@email.com"
              autoComplete="email"
              {...register("email")}
              {...control}
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
        disabled={recovery.isPending}
        className={authSubmitClassName}
      >
        <Send aria-hidden />
        {recovery.isPending ? "Enviando..." : "Enviar link"}
      </Button>
    </form>
  );
}
