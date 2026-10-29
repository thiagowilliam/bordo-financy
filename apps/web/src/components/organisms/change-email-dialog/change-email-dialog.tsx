"use client";

import { Info, Mail, Send, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { ResponsiveModal } from "@/components/organisms/responsive-modal";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export type ChangeEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
  onSubmit: (email: string) => void;
  isPending?: boolean;
  /** Server error shown under the field. */
  error?: string;
};

function createEmailSchema(currentEmail: string) {
  return z
    .string()
    .trim()
    .min(1, "Informe o novo e-mail")
    .pipe(z.email("E-mail inválido"))
    .refine(
      (value) => value.toLowerCase() !== currentEmail.trim().toLowerCase(),
      "Use um e-mail diferente do atual",
    );
}

type ChangeEmailFormProps = Omit<ChangeEmailDialogProps, "open" | "onOpenChange">;

function ChangeEmailForm({
  currentEmail,
  onSubmit,
  isPending = false,
  error,
}: ChangeEmailFormProps) {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string>();

  const handleSubmit = () => {
    if (isPending) return;
    const result = createEmailSchema(currentEmail).safeParse(email);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message);
      return;
    }
    setValidationError(undefined);
    onSubmit(result.data);
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      className="flex flex-col gap-4 md:gap-5"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <DialogTitle className="text-xl leading-tight font-bold tracking-[-0.3px] text-foreground md:text-[22px]">
            Alterar e-mail
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Seu e-mail atual é <span className="font-semibold text-foreground">{currentEmail}</span>
            .
          </DialogDescription>
        </div>
        <DialogClose
          aria-label="Fechar"
          disabled={isPending}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <X aria-hidden className="size-4" />
        </DialogClose>
      </header>

      <FormField label="Novo e-mail" error={validationError ?? error}>
        {(control) => (
          <TextField
            {...control}
            type="email"
            icon={<Mail />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
            autoFocus
            disabled={isPending}
            placeholder="voce@exemplo.com"
            className="focus-visible:border-[1.5px] focus-visible:border-primary focus-visible:ring-0"
          />
        )}
      </FormField>

      <div className="flex items-start gap-2.5 rounded-xl bg-primary-soft px-3.5 py-3 text-[13px] leading-5 font-medium text-primary-strong">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Enviaremos um link de confirmação para o novo endereço. Até confirmar, você continua
          entrando com o e-mail atual.
        </p>
      </div>

      <footer className="flex flex-row gap-2 pt-1 md:justify-end md:gap-3">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className="h-auto flex-1 border-border bg-card px-6 py-3.5 text-base font-bold md:flex-none"
          >
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={isPending}
          className="h-auto flex-1 gap-2 px-6 py-3.5 text-base font-bold md:flex-none md:px-7 [&_svg]:size-[18px]"
        >
          <Send aria-hidden />
          {isPending ? "Enviando..." : "Enviar link"}
        </Button>
      </footer>
    </form>
  );
}

/** Asks for the new e-mail and sends a confirmation link. State resets each time it opens. */
export function ChangeEmailDialog({ open, onOpenChange, ...formProps }: ChangeEmailDialogProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      locked={formProps.isPending}
      desktopClassName="sm:max-w-[480px]"
    >
      <ChangeEmailForm {...formProps} />
    </ResponsiveModal>
  );
}
