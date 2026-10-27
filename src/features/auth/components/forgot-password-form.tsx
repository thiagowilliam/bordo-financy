"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { FormNotice } from "@/components/molecules/form-notice";
import { Button } from "@/components/ui/button";

import { useRequestPasswordRecovery } from "../api/mutations";
import { forgotPasswordSchema } from "../schemas/auth.schema";
import type { ForgotPasswordInput } from "../types";

/** Asks for the e-mail and confirms that the recovery link was sent. */
export function ForgotPasswordForm() {
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
        {recovery.isSuccess ? (
          <FormNotice>
            Link enviado! Confira sua caixa de entrada em {recovery.data.email}. Pode levar alguns
            minutos.
          </FormNotice>
        ) : null}
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
        className="w-full"
      >
        <Send aria-hidden />
        {recovery.isPending ? "Enviando..." : "Enviar link"}
      </Button>
    </form>
  );
}
