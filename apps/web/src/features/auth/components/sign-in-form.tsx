"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { PasswordField } from "@/components/molecules/password-field";
import { AuthFooterLink } from "@/components/templates/auth-card";
import { authSubmitClassName } from "@/components/templates/auth-card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { safeRedirectPath } from "@/lib/auth-routes";

import { useSignIn } from "../api/mutations";
import { signInSchema } from "@bordo/shared/auth";
import type { SignInInput } from "../types";

export type SignInFormProps = {
  /** Locks the form, e.g. while the Google sign in is under way. */
  disabled?: boolean;
  /** Where to go after signing in, from the `?next=` of the guard redirect. Validated here. */
  next?: string;
};

const errorMessage = (error: unknown) =>
  error instanceof ApiError && error.status === 401
    ? "E-mail ou senha incorretos."
    : "Não foi possível entrar. Tente de novo.";

/** Email and password sign in. The session cookie is set by the backend. */
export function SignInForm({ next, disabled }: SignInFormProps) {
  const router = useRouter();
  const signIn = useSignIn();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  const onSubmit = handleSubmit((values) => {
    setFormError(undefined);
    signIn.mutate(values, {
      onSuccess: () => router.replace(safeRedirectPath(next) as "/"),
      onError: (error) => setFormError(errorMessage(error)),
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
              disabled={disabled}
              {...register("email")}
              {...control}
            />
          )}
        </FormField>
        <FormField label="Senha" error={errors.password?.message}>
          {(control) => (
            <PasswordField
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={disabled}
              {...register("password")}
              {...control}
            />
          )}
        </FormField>
        <div className="flex justify-end">
          <AuthFooterLink href="/recuperar-senha">Esqueci minha senha</AuthFooterLink>
        </div>
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
        disabled={disabled || signIn.isPending}
        className={authSubmitClassName}
      >
        {signIn.isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
