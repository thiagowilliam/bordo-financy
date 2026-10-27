import { Check, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SecuritySectionProps = Omit<React.ComponentProps<"section">, "children"> & {
  provider: "PASSWORD" | "GOOGLE";
  email: string;
  linkSent: boolean;
  isSending?: boolean;
  onSendPasswordLink: () => void;
};

/** Security card: password reset link for password accounts, an info row for Google accounts. */
export function SecuritySection({
  provider,
  email,
  linkSent,
  isSending,
  onSendPasswordLink,
  className,
  ...props
}: SecuritySectionProps) {
  return (
    <section
      aria-labelledby="security-title"
      className={cn(
        "flex flex-col gap-5 rounded-xl border border-border bg-card p-5 md:p-7",
        className,
      )}
      {...props}
    >
      <h2 id="security-title" className="text-lg font-bold text-foreground">
        Segurança
      </h2>
      {provider === "GOOGLE" ? (
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="flex size-10.5 shrink-0 items-center justify-center rounded-xl bg-background text-lg font-bold text-foreground"
          >
            G
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-foreground">Você entra com sua conta Google</p>
            <p className="text-sm text-muted-foreground">
              A senha é gerenciada pelo Google, por isso não há nada para alterar aqui.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold text-foreground">Senha</p>
              <p className="text-sm text-muted-foreground">
                Enviaremos um link para o seu e-mail para criar uma nova senha.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onSendPasswordLink}
              disabled={isSending}
              className="h-auto shrink-0 px-4 py-2.5 font-semibold"
            >
              <KeyRound aria-hidden />
              {isSending ? "Enviando..." : linkSent ? "Reenviar link" : "Alterar senha"}
            </Button>
          </div>
          {linkSent ? (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg bg-success-soft px-3.5 py-3 text-sm font-medium text-success-ink"
            >
              <Check aria-hidden className="size-4 shrink-0" />
              Link enviado para {email}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
