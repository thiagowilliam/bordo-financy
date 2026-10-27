"use client";

import type { ReactNode } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { cn } from "@/lib/utils";

export type FilterSurfaceProps = {
  /** The trigger element (a `FilterButton`). It receives the open/close behavior. */
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name of the popover and title of the bottom sheet. */
  title: string;
  /** Action next to the title of the bottom sheet (below md only), e.g. a "Limpar" button. */
  mobileAction?: ReactNode;
  /** Width and other classes of the desktop popover. */
  popoverClassName?: string;
  /** Content, or a function receiving whether the desktop layout is active. */
  children: ReactNode | ((isDesktop: boolean) => ReactNode);
};

/** Popover from md up, bottom sheet with grabber and header below. */
export function FilterSurface({
  trigger,
  open,
  onOpenChange,
  title,
  mobileAction,
  popoverClassName,
  children,
}: FilterSurfaceProps) {
  const isDesktop = useIsDesktop();
  const content = typeof children === "function" ? children(isDesktop) : children;

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          aria-label={title}
          className={cn(
            "gap-0 rounded-xl border border-border bg-card p-2.5 shadow-popover ring-0",
            popoverClassName,
          )}
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-describedby={undefined}
        overlayClassName="bg-foreground/50 supports-backdrop-filter:backdrop-blur-none"
        className="max-h-[85dvh] gap-0 rounded-t-3xl bg-card px-5 pt-2.5 pb-6 shadow-[0_-8px_32px_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
      >
        <div aria-hidden className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border" />
        <div className="mb-3.5 flex shrink-0 items-center justify-between">
          <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
          {mobileAction}
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto">{content}</div>
      </SheetContent>
    </Sheet>
  );
}
