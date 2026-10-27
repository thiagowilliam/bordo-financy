"use client";

import { Check, Download, Trash2, X } from "lucide-react";
import { useState } from "react";

import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { ResponsiveModal } from "@/components/organisms/responsive-modal";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export type DeleteAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Number of trips that will be deleted, shown in the list. */
  tripCount: number;
  onExport: () => void;
  isExporting?: boolean;
  onConfirm: () => void;
  isPending?: boolean;
  /** Server error shown under the confirmation field. */
  error?: string;
};

const CONFIRMATION_WORD = "EXCLUIR";

type DeleteAccountFormProps = Omit<DeleteAccountDialogProps, "open" | "onOpenChange">;

function DeleteAccountForm({
  tripCount,
  onExport,
  isExporting = false,
  onConfirm,
  isPending = false,
  error,
}: DeleteAccountFormProps) {
  const [text, setText] = useState("");
  const matches = text.trim() === CONFIRMATION_WORD;
  const items = [
    `Todas as suas viagens (${tripCount}) e os gastos registrados`,
    "Todas as fotos que você enviou",
    "Seu perfil, categorias e preferências",
  ];

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (matches && !isPending) onConfirm();
      }}
      className="flex flex-col gap-4 md:gap-5"
    >
      <header className="flex items-start justify-between gap-4">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive-ink"
        >
          <Trash2 className="size-5.5" />
        </span>
        <DialogClose
          aria-label="Fechar"
          disabled={isPending}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <X aria-hidden className="size-4" />
        </DialogClose>
      </header>

      <div className="flex flex-col gap-1.5">
        <DialogTitle className="text-xl leading-tight font-bold tracking-[-0.3px] text-foreground md:text-[22px]">
          Excluir sua conta?
        </DialogTitle>
        <DialogDescription className="text-[15px] text-muted-foreground">
          Esta ação é permanente e não pode ser desfeita. Vamos apagar:
        </DialogDescription>
      </div>

      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
            <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-destructive-ink" />
            {item}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 rounded-[14px] bg-background px-3.5 py-3">
        <Download aria-hidden className="size-4.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-sm font-semibold text-foreground">
          Quer exportar seus dados antes?
        </span>
        <Button
          type="button"
          variant="ghost"
          disabled={isExporting || isPending}
          onClick={onExport}
          className="h-auto px-2 py-1 text-sm font-bold text-primary"
        >
          {isExporting ? "Exportando..." : "Exportar CSV"}
        </Button>
      </div>

      <FormField label="Digite EXCLUIR para confirmar" error={error}>
        {(control) => (
          <div className="relative">
            <TextField
              {...control}
              value={text}
              onChange={(event) => setText(event.target.value)}
              autoComplete="off"
              disabled={isPending}
              placeholder={CONFIRMATION_WORD}
              className={matches ? "pr-11.5" : undefined}
            />
            {matches ? (
              <Check
                data-testid="confirmation-check"
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-4 size-4.5 -translate-y-1/2 text-success-ink"
              />
            ) : null}
          </div>
        )}
      </FormField>

      <footer className="flex flex-col gap-2 pt-1 md:flex-row-reverse md:gap-3">
        <Button
          type="submit"
          disabled={!matches || isPending}
          className="h-auto gap-2 bg-destructive px-6 py-3.5 text-base font-bold text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30 md:px-7 [&_svg]:size-[18px]"
        >
          <Trash2 aria-hidden />
          {isPending ? "Excluindo..." : "Excluir conta"}
        </Button>
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className="h-auto border-border bg-card px-6 py-3.5 text-base font-bold"
          >
            Cancelar
          </Button>
        </DialogClose>
      </footer>
    </form>
  );
}

/** Destructive confirmation that requires typing EXCLUIR. Centered card on mobile. */
export function DeleteAccountDialog({
  open,
  onOpenChange,
  ...formProps
}: DeleteAccountDialogProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      locked={formProps.isPending}
      mobileVariant="center"
      desktopClassName="max-w-[480px]"
    >
      <DeleteAccountForm {...formProps} />
    </ResponsiveModal>
  );
}
