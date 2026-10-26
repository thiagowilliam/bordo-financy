"use client";

import type { ComponentProps, ReactNode } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { cn } from "@/lib/utils";

export type ResponsiveModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Width classes of the centered dialog, e.g. `max-w-[540px]`. */
  desktopClassName?: string;
  /** Extra classes of the bottom sheet. */
  mobileClassName?: string;
  /** Blocks Escape, overlay click and close requests (e.g. while a request is pending). */
  locked?: boolean;
  /** Below md: `sheet` is a bottom sheet, `center` keeps a centered dialog over the scrim. */
  mobileVariant?: "sheet" | "center";
  onOpenAutoFocus?: ComponentProps<typeof DialogContent>["onOpenAutoFocus"];
  /** Must contain a `DialogTitle` and a `DialogDescription` (can be `sr-only`). */
  children: ReactNode;
};

/** Centered dialog from md up, bottom sheet with grabber below. Same Radix dialog semantics. */
export function ResponsiveModal({
  open,
  onOpenChange,
  desktopClassName,
  mobileClassName,
  locked = false,
  mobileVariant = "sheet",
  onOpenAutoFocus,
  children,
}: ResponsiveModalProps) {
  const isDesktop = useIsDesktop();
  const handleOpenChange = (next: boolean) => {
    if (locked && !next) return;
    onOpenChange(next);
  };

  if (isDesktop || mobileVariant === "center") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          onOpenAutoFocus={onOpenAutoFocus}
          className={cn(
            "max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto bg-card text-card-foreground shadow-popover ring-0",
            isDesktop
              ? "rounded-2xl p-7 sm:max-w-[calc(100%-2rem)]"
              : "w-[min(342px,calc(100vw-48px))] max-w-none rounded-3xl p-6 sm:max-w-none",
            isDesktop && desktopClassName,
          )}
        >
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        onOpenAutoFocus={onOpenAutoFocus}
        overlayClassName="bg-foreground/50 supports-backdrop-filter:backdrop-blur-none"
        className={cn(
          "max-h-[92dvh] gap-3.5 overflow-y-auto rounded-t-3xl bg-card px-5 pt-2.5 pb-6 shadow-[0_-8px_32px_color-mix(in_oklch,var(--foreground)_20%,transparent)] data-[side=bottom]:border-t-0",
          mobileClassName,
        )}
      >
        <div aria-hidden className="mx-auto h-1 w-10 shrink-0 rounded-full bg-border" />
        {children}
      </SheetContent>
    </Sheet>
  );
}
