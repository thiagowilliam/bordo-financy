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
  /** Disables both buttons, shows "Excluindo..." and blocks Escape and overlay close. */
  isPending?: boolean;
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
  isPending = false,
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
        <DialogHeader className="gap-2">
          <DialogTitle className="text-lg leading-snug font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="m-0 flex-col-reverse gap-2 rounded-none border-0 bg-transparent p-0 sm:flex-row sm:justify-end">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="h-10 px-4"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="h-10 bg-destructive px-4 text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30"
          >
            {isPending ? "Excluindo..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
