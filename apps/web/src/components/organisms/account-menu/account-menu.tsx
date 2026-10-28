"use client";

import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/atoms/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type AccountMenuProps = {
  user: { name: string; email: string; photoUrl?: string | null };
  onSignOut: () => void;
  /** Disables the Sair item and shows "Saindo...". */
  isSigningOut?: boolean;
  className?: string;
};

const itemClass =
  "gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground [&_svg:not([class*='size-'])]:size-4.5 [&_svg]:text-muted-foreground";

/** Sidebar account trigger that opens a menu above it with profile, settings and sign out. */
export function AccountMenu({
  user,
  onSignOut,
  isSigningOut = false,
  className,
}: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu da conta"
        className={cn(
          "flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-accent",
          className,
        )}
      >
        <Avatar name={user.name} src={user.photoUrl} />
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-subtle-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        className="flex w-60 flex-col gap-0.5 rounded-lg border border-border bg-card p-2 text-card-foreground shadow-popover ring-0"
      >
        <div className="flex items-center gap-2.5 px-3 pt-2 pb-2.5">
          <Avatar name={user.name} src={user.photoUrl} size="menu" />
          <div className="flex min-w-0 flex-col gap-px">
            <span className="truncate text-sm font-bold text-foreground">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator className="mx-1 my-1" />
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/perfil">
            <User />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/configuracoes/categorias">
            <Settings />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-1 my-1" />
        <DropdownMenuItem
          disabled={isSigningOut}
          onSelect={onSignOut}
          className={cn(
            itemClass,
            "text-destructive-ink focus:bg-destructive-soft focus:text-destructive-ink focus:**:text-destructive-ink [&_svg]:text-destructive-ink",
          )}
        >
          <LogOut />
          {isSigningOut ? "Saindo..." : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
