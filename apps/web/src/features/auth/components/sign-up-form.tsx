"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { PasswordField } from "@/components/molecules/password-field";
import { authSubmitClassName } from "@/components/templates/auth-card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";

import { useSignUp } from "../api/mutations";
import { signUpSchema } from "@bordo/shared/auth";
import type { SignUpInput } from "../types";

export type SignUpFormProps = {
  /** Locks the form, e.g. while the Google sign up is under way. */
  disabled?: boolean;
};

/** Account creation with email and password. New accounts continue to the onboarding. */
export function SignUpForm({ disabled }: SignUpFormProps) {
  const router = useRouter();
  const signUp = useSignUp();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = handleSubmit(({ email, password }) => {
    setFormError(undefined);
    signUp.mutate(
      { email, password },
      {
        onSuccess: () => router.replace("/onboarding"),
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setError("email", { message: "Já existe uma conta com este e-mail." });
          } else {
            setFormError("Não foi possível criar a conta. Tente de novo.");
          }
        },
      },
    );
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
              disabled={disabled}
              {...register("email")}
              {...control}
            />
          )}
        </FormField>
        <FormField label="Senha" error={errors.password?.message}>
          {(control) => (
            <PasswordField
              placeholder="Mínimo de 8 caracteres"
              autoComplete="new-password"
              disabled={disabled}
              {...register("password")}
              {...control}
            />
          )}
        </FormField>
        <FormField label="Confirmar senha" error={errors.confirmPassword?.message}>
          {(control) => (
            <PasswordField
              placeholder="Repita a senha"
              autoComplete="new-password"
              disabled={disabled}
              {...register("confirmPassword")}
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
        disabled={disabled || signUp.isPending}
        className={authSubmitClassName}
      >
        {signUp.isPending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
