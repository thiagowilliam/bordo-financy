"use client";

import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/atoms/avatar";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type AccountSheetProps = {
  user: { name: string; email: string; photoUrl?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
  /** Disables the Sair row and shows "Saindo...". */
  isSigningOut?: boolean;
};

const rowClass =
  "flex w-full items-center gap-3 rounded-md px-3 py-[15px] text-base font-medium outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-5.5 [&_svg]:shrink-0";

/** Mobile bottom sheet with the account links and sign out. */
export function AccountSheet({
  user,
  open,
  onOpenChange,
  onSignOut,
  isSigningOut = false,
}: AccountSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName="bg-foreground/50 supports-backdrop-filter:backdrop-blur-none"
        className="gap-1 rounded-t-3xl border-t-0 bg-card px-5 pt-2.5 pb-[calc(2.125rem+env(safe-area-inset-bottom))] text-card-foreground shadow-popover"
      >
        <span aria-hidden="true" className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-border" />
        <SheetTitle className="sr-only">Menu da conta</SheetTitle>
        <SheetDescription className="sr-only">
          Acesse seu perfil, as configurações ou saia da conta.
        </SheetDescription>
        <div className="flex items-center gap-3.5 px-2 pt-1.5 pb-3.5">
          <Avatar name={user.name} src={user.photoUrl} size="sheet" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[17px] font-bold text-foreground">{user.name}</span>
            <span className="truncate text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <div role="separator" className="my-1 h-px bg-border" />
        <nav aria-label="Conta" className="flex flex-col">
          <Link
            href="/perfil"
            onClick={() => onOpenChange(false)}
            className={cn(rowClass, "text-foreground")}
          >
            <User className="text-muted-foreground" />
            Perfil
          </Link>
          <Link
            href="/configuracoes/categorias"
            onClick={() => onOpenChange(false)}
            className={cn(rowClass, "text-foreground")}
          >
            <Settings className="text-muted-foreground" />
            Configurações
          </Link>
        </nav>
        <div role="separator" className="my-1 h-px bg-border" />
        <button
          type="button"
          disabled={isSigningOut}
          onClick={onSignOut}
          className={cn(
            rowClass,
            "text-destructive-ink hover:bg-destructive-soft disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          <LogOut />
          {isSigningOut ? "Saindo..." : "Sair"}
        </button>
      </SheetContent>
    </Sheet>
  );
}
