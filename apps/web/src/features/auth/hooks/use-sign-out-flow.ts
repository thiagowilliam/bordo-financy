"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { SIGN_IN_PATH } from "@/lib/auth-routes";
import { selectHasUnsavedChanges, useUnsavedChangesStore } from "@/stores/unsaved-changes";

import { useSignOut } from "../api/mutations";

/** Query param that makes `/entrar` confirm the sign out with a toast. */
export const SIGNED_OUT_PARAM = "saiu";

/**
 * Sign out from the account menu. With unsaved edits on screen it first asks for confirmation.
 * On success it goes to `/entrar` (the session cookie is cleared by the backend and the cache is
 * dropped by `useSignOut`).
 */
export function useSignOutFlow() {
  const router = useRouter();
  const signOut = useSignOut();
  const hasUnsavedChanges = useUnsavedChangesStore(selectHasUnsavedChanges);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmSignOut = () =>
    signOut.mutate(undefined, {
      onSuccess: () => router.replace(`${SIGN_IN_PATH}?${SIGNED_OUT_PARAM}=1`),
      onError: () => {
        setConfirmOpen(false);
        toast.error("Não foi possível sair. Tente novamente.");
      },
    });

  return {
    /** Stays true after success until the navigation lands, so the menu cannot be triggered twice. */
    isSigningOut: signOut.isPending || signOut.isSuccess,
    confirmOpen,
    setConfirmOpen,
    requestSignOut: () => (hasUnsavedChanges ? setConfirmOpen(true) : confirmSignOut()),
    confirmSignOut,
  };
}

export type SignOutFlow = ReturnType<typeof useSignOutFlow>;
