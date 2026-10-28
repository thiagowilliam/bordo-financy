"use client";

import { LogOut } from "lucide-react";

import { ConfirmDialog } from "@/components/organisms/confirm-dialog";

import type { SignOutFlow } from "../hooks/use-sign-out-flow";

export type SignOutConfirmDialogProps = { flow: SignOutFlow };

/** "Sair sem salvar?": shown when the user signs out with unsaved edits on screen. */
export function SignOutConfirmDialog({ flow }: SignOutConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={flow.confirmOpen}
      onOpenChange={flow.setConfirmOpen}
      title="Sair sem salvar?"
      description="Você tem alterações que ainda não foram salvas e elas serão perdidas."
      cancelLabel="Continuar editando"
      confirmLabel="Sair mesmo assim"
      confirmIcon={<LogOut />}
      pendingLabel="Saindo..."
      stacked
      isPending={flow.isSigningOut}
      onConfirm={flow.confirmSignOut}
    />
  );
}
