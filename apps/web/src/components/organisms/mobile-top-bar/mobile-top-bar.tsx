"use client";

import { useState } from "react";

import { Avatar } from "@/components/atoms/avatar";
import { Logo } from "@/components/atoms/logo";
import { AccountSheet } from "@/components/organisms/account-sheet";
import { cn } from "@/lib/utils";

export type MobileTopBarProps = Omit<React.ComponentProps<"header">, "children"> & {
  user: { name: string; email: string; photoUrl?: string | null };
  onSignOut: () => void;
  isSigningOut?: boolean;
};

/** Top bar shown below the md breakpoint, where the sidebar is hidden. */
export function MobileTopBar({
  user,
  onSignOut,
  isSigningOut,
  className,
  ...props
}: MobileTopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className={cn("flex items-center justify-between", className)} {...props}>
      <Logo />
      <button
        type="button"
        aria-label="Abrir menu da conta"
        onClick={() => setOpen(true)}
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar name={user.name} src={user.photoUrl} size="lg" />
      </button>
      <AccountSheet
        user={user}
        open={open}
        onOpenChange={setOpen}
        onSignOut={onSignOut}
        isSigningOut={isSigningOut}
      />
    </header>
  );
}
