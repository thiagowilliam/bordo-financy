"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Label of the destructive button. */
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  /** Icon rendered before the confirm label. */
  confirmIcon?: React.ReactNode;
  /** Confirm label while pending. */
  pendingLabel?: string;
  /** Disables both buttons, shows the pending label and blocks Escape and overlay close. */
  isPending?: boolean;
  /** Full width buttons, cancel on top, larger type: the layout of the mobile sign out prompt. */
  stacked?: boolean;
  className?: string;
};

/** Centered confirmation for destructive actions. Focus starts on the cancel button. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  onConfirm,
  confirmIcon,
  pendingLabel = "Excluindo...",
  isPending = false,
  stacked = false,
  className,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (isPending && !next ? undefined : onOpenChange(next))}
    >
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelRef.current?.focus();
        }}
        className={cn(
          "max-w-sm gap-5 rounded-2xl bg-card p-6 text-card-foreground shadow-popover ring-0 sm:max-w-sm",
          className,
        )}
      >
        <DialogHeader className={cn("gap-2", stacked && "gap-2.5")}>
          <DialogTitle
            className={cn(
              "text-lg leading-snug font-bold text-foreground",
              stacked && "text-[22px] tracking-tight",
            )}
          >
            {title}
          </DialogTitle>
          <DialogDescription
            className={cn("text-sm text-muted-foreground", stacked && "text-[15px] leading-[1.45]")}
          >
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter
          className={cn(
            "m-0 gap-2 rounded-none border-0 bg-transparent p-0 sm:flex-row sm:justify-end",
            stacked ? "flex-col gap-2.5" : "flex-col-reverse",
          )}
        >
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className={cn("h-10 px-4", stacked && "h-12 text-base font-bold sm:w-auto")}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={cn(
              "h-10 bg-destructive px-4 text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30",
              stacked && "h-12 text-base font-bold [&_svg:not([class*='size-'])]:size-4.5",
            )}
          >
            {!isPending && confirmIcon}
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
