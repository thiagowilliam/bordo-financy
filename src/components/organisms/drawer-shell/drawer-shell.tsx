"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { cn } from "@/lib/utils";

export type DrawerShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Line under the title, e.g. "Lisboa & Sintra · Dia 11". */
  context?: string;
  /** Accessible description of the drawer (read by screen readers, not shown). */
  description: string;
  /** Body slot: scrollable, stacked with a gap. */
  children: ReactNode;
  /** Footer slot: pinned under the body, separated by a border. */
  footer?: ReactNode;
  /** Controls row: first item of the body on md+, fills the header next to the close button below md. */
  toolbar?: ReactNode;
  className?: string;
};

/** Side panel from md up, bottom sheet with grabber below. Header, scrollable body and footer. */
export function DrawerShell({
  open,
  onOpenChange,
  title,
  context,
  description,
  children,
  footer,
  toolbar,
  className,
}: DrawerShellProps) {
  const isDesktop = useIsDesktop();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        showCloseButton={false}
        overlayClassName="bg-foreground/55 md:bg-foreground/50 supports-backdrop-filter:backdrop-blur-none"
        className={cn(
          "bg-card data-[side=bottom]:border-t-0 data-[side=right]:border-l-0",
          isDesktop
            ? "gap-4 px-8 py-7 shadow-[-8px_0_32px_color-mix(in_oklch,var(--foreground)_15%,transparent)] data-[side=right]:w-[460px] data-[side=right]:max-w-full data-[side=right]:sm:max-w-[460px]"
            : "max-h-[92svh] gap-3.5 rounded-t-3xl px-5 pt-2.5 pb-[22px] shadow-[0_-6px_30px_color-mix(in_oklch,var(--foreground)_15%,transparent)]",
          className,
        )}
      >
        {isDesktop ? null : (
          <div aria-hidden className="mx-auto h-1 w-10 shrink-0 rounded-full bg-border" />
        )}
        <header
          className={cn(
            "flex shrink-0 justify-between",
            isDesktop ? "items-center gap-4" : "items-center gap-3",
          )}
        >
          {isDesktop ? (
            <div className="flex min-w-0 flex-col gap-0.5">
              <SheetTitle className="text-2xl font-bold tracking-[-0.4px] text-foreground">
                {title}
              </SheetTitle>
              {context ? <p className="text-[13px] text-muted-foreground">{context}</p> : null}
            </div>
          ) : (
            <>
              <SheetTitle className="sr-only">{title}</SheetTitle>
              <div className="min-w-0 flex-1">{toolbar}</div>
            </>
          )}
          <SheetClose
            aria-label="Fechar"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <X aria-hidden className="size-4.5" />
          </SheetClose>
        </header>
        <SheetDescription className="sr-only">{description}</SheetDescription>
        <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1 py-1">
          {isDesktop ? toolbar : null}
          {children}
        </div>
        {footer ? (
          <footer className="flex shrink-0 flex-col gap-3 pt-1 md:border-t md:border-border md:pt-4">
            {footer}
          </footer>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
