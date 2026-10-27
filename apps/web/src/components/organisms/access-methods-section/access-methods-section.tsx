import { KeyRound, Lock, Plus, Send } from "lucide-react";

import { GoogleLogo } from "@/components/atoms/google-logo";
import { FormNotice } from "@/components/molecules/form-notice";
import { GoogleButton } from "@/components/molecules/google-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AccessMethodsSectionProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** Connected Google account e-mail, null when not connected. */
  googleEmail: string | null;
  hasPassword: boolean;
  /** Account e-mail, used in the "link sent" note. */
  email: string;
  linkSent: boolean;
  isSending?: boolean;
  onSendPasswordLink: () => void;
  onConnectGoogle: () => void;
  isConnectingGoogle?: boolean;
};

const rowClasses = "flex flex-col gap-4 md:flex-row md:items-center";
const tileClasses =
  "flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card";

/** Profile card listing the ways to sign in (Google and e-mail/password). */
export function AccessMethodsSection({
  googleEmail,
  hasPassword,
  email,
  linkSent,
  isSending,
  onSendPasswordLink,
  onConnectGoogle,
  isConnectingGoogle,
  className,
  ...props
}: AccessMethodsSectionProps) {
  const passwordLabel = isSending
    ? "Enviando..."
    : linkSent
      ? "Reenviar link"
      : hasPassword
        ? "Alterar senha"
        : "Adicionar senha";
  const PasswordIcon = linkSent ? Send : hasPassword ? KeyRound : Plus;

  return (
    <section
      aria-labelledby="access-methods-title"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 md:gap-5 md:p-7",
        className,
      )}
      {...props}
    >
      <h2 id="access-methods-title" className="text-[17px] font-bold text-foreground md:text-lg">
        Métodos de acesso
      </h2>

      <div className={rowClasses}>
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span aria-hidden="true" className={tileClasses}>
            <GoogleLogo className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-base font-semibold text-foreground">Google</p>
            <p className="text-sm text-muted-foreground">
              {googleEmail
                ? `Conectado como ${googleEmail}`
                : "Entre com um clique usando sua conta Google."}
            </p>
          </div>
        </div>
        {googleEmail ? (
          <span className="inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-2.5 text-xs font-semibold text-success-ink">
            <span aria-hidden className="size-1.75 rounded-full bg-success" />
            Conectado
          </span>
        ) : (
          <GoogleButton
            size="sm"
            label="Conectar Google"
            isLoading={isConnectingGoogle}
            onClick={onConnectGoogle}
            className="w-full justify-center md:w-auto"
          />
        )}
      </div>

      <hr className="border-border" />

      <div className={rowClasses}>
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span aria-hidden="true" className={tileClasses}>
            <Lock className="size-5 text-muted-foreground" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-base font-semibold text-foreground">E-mail e senha</p>
            <p className="text-sm text-muted-foreground">
              {hasPassword
                ? "Enviaremos um link para o seu e-mail para criar uma nova senha."
                : "Adicione uma senha para entrar também com seu e-mail."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onSendPasswordLink}
          disabled={isSending}
          className="h-auto w-full shrink-0 justify-center bg-card px-4.5 py-3.25 text-[15px] font-bold md:w-auto md:py-2.75 md:text-sm"
        >
          <PasswordIcon aria-hidden />
          {passwordLabel}
        </Button>
      </div>
      {linkSent ? (
        <FormNotice tone="success" compact>
          <span className="text-sm font-semibold">
            {hasPassword
              ? `Enviamos um link para ${email} criar sua nova senha.`
              : `Enviamos um link para ${email} criar sua senha.`}
          </span>
        </FormNotice>
      ) : null}

      <hr className="border-border" />

      <p className="text-[13px] text-muted-foreground">
        Todos os métodos levam para a mesma conta, com as mesmas viagens.
      </p>
    </section>
  );
}
