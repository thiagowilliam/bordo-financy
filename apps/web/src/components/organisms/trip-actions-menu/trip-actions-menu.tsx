"use client";

import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { cn } from "@/lib/utils";

export type TripActionsMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
};

const triggerClass =
  "flex size-9 items-center justify-center rounded-lg bg-white/90 text-foreground shadow-float outline-none hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-white";

const itemClass =
  "gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground [&_svg:not([class*='size-'])]:size-4.5 [&_svg]:text-muted-foreground";

const sheetRowClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-base font-semibold text-foreground outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-5 [&_svg]:shrink-0";

function stopNavigation(event: React.SyntheticEvent) {
  event.stopPropagation();
  event.preventDefault();
}

/** "⋯" button with edit and delete: dropdown from md up, bottom sheet below. Safe over a link. */
export function TripActionsMenu({ onEdit, onDelete, className }: TripActionsMenuProps) {
  const isDesktop = useIsDesktop();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (isDesktop) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Opções da viagem"
          onClick={(event) => {
            event.stopPropagation();
          }}
          className={cn(triggerClass, className)}
        >
          <Ellipsis aria-hidden className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          onClick={(event) => event.stopPropagation()}
          className="flex w-52 flex-col gap-0.5 rounded-lg border border-border bg-card p-2 text-card-foreground shadow-popover ring-0"
        >
          <DropdownMenuItem onSelect={onEdit} className={itemClass}>
            <Pencil />
            Editar viagem
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mx-1 my-1" />
          <DropdownMenuItem
            onSelect={onDelete}
            className={cn(
              itemClass,
              "text-destructive-ink focus:bg-destructive-soft focus:text-destructive-ink [&_svg]:text-destructive-ink focus:[&_svg]:text-destructive-ink",
            )}
          >
            <Trash2 />
            Excluir viagem
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  function choose(handler: () => void) {
    setSheetOpen(false);
    handler();
  }

  return (
    <>
      <button
        type="button"
        aria-label="Opções da viagem"
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        onClick={(event) => {
          stopNavigation(event);
          setSheetOpen(true);
        }}
        className={cn(triggerClass, className)}
      >
        <Ellipsis aria-hidden className="size-5" />
      </button>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          aria-describedby={undefined}
          overlayClassName="bg-foreground/50 supports-backdrop-filter:backdrop-blur-none"
          className="gap-0 rounded-t-3xl bg-card px-5 pt-2.5 pb-6 shadow-[0_-8px_32px_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div aria-hidden className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border" />
          <SheetTitle className="sr-only">Opções da viagem</SheetTitle>
          <div className="flex flex-col gap-1">
            <button type="button" onClick={() => choose(onEdit)} className={sheetRowClass}>
              <Pencil aria-hidden className="text-muted-foreground" />
              Editar viagem
            </button>
            <button
              type="button"
              onClick={() => choose(onDelete)}
              className={cn(sheetRowClass, "text-destructive-ink hover:bg-destructive-soft")}
            >
              <Trash2 aria-hidden />
              Excluir viagem
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className={cn(sheetRowClass, "mt-1 justify-center border border-border")}
            >
              Cancelar
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
