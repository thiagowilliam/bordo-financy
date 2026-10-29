"use client";

import { CalendarDays, Download, Image as ImageIcon, Trash2, Wallet } from "lucide-react";
import { useRef } from "react";

import { ResponsiveModal } from "@/components/organisms/responsive-modal";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

export type DeleteTripDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  dailyCount: number;
  baseCount: number;
  photoCount: number;
  onConfirm: () => void;
  /** When given, shows a link to export the expenses as CSV before deleting. */
  onExportCsv?: () => void;
  isPending?: boolean;
};

function plural(count: number, singular: string, pluralLabel: string) {
  return `${count} ${count === 1 ? singular : pluralLabel}`;
}

/** Confirms deleting a trip, summarizing everything that goes with it. */
export function DeleteTripDialog({
  open,
  onOpenChange,
  name,
  dailyCount,
  baseCount,
  photoCount,
  onConfirm,
  onExportCsv,
  isPending = false,
}: DeleteTripDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  const rows = [
    { Icon: CalendarDays, label: plural(dailyCount, "gasto do dia a dia", "gastos do dia a dia") },
    { Icon: Wallet, label: plural(baseCount, "custo de base", "custos de base") },
    { Icon: ImageIcon, label: plural(photoCount, "foto", "fotos") },
  ];

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      locked={isPending}
      mobileVariant="center"
      desktopClassName="max-w-[480px]"
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        cancelRef.current?.focus();
      }}
    >
      <div className="flex flex-col gap-4">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-full bg-destructive-soft text-destructive-ink"
        >
          <Trash2 className="size-[22px]" />
        </span>
        <div className="flex flex-col gap-2">
          <DialogTitle className="text-[21px] leading-tight font-bold tracking-[-0.3px] text-foreground md:text-[22px]">
            {`Excluir ${name}?`}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-normal text-muted-foreground">
            Esta viagem e tudo o que está nela serão excluídos.
          </DialogDescription>
        </div>

        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {rows.map(({ Icon, label }) => (
            <li
              key={label.replace(/^\d+ /, "")}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground"
            >
              <Icon aria-hidden className="size-[18px] shrink-0 text-muted-foreground" />
              {label}
            </li>
          ))}
        </ul>

        {onExportCsv ? (
          <button
            type="button"
            onClick={onExportCsv}
            disabled={isPending}
            className="flex items-center gap-2 self-start rounded-sm text-sm font-medium text-muted-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 [&_svg]:size-4"
          >
            <Download aria-hidden />
            Exportar os gastos em CSV antes de excluir
          </button>
        ) : null}

        <div className="flex flex-col-reverse gap-2 pt-1 md:flex-row md:justify-end md:gap-3">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="h-auto gap-2 border border-border bg-card px-6 py-3.5 text-base font-bold [&_svg]:size-[18px]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="h-auto gap-2 bg-destructive px-6 py-3.5 text-base font-bold text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30 [&_svg]:size-[18px]"
          >
            <Trash2 aria-hidden />
            {isPending ? "Excluindo..." : "Excluir viagem"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
