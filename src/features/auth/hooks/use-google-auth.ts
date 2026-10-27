"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { profileKeys } from "@/features/profile/api/keys";
import { env } from "@/lib/env";

import { fetchMockGoogleRedirect, getGoogleUrl } from "../api/client";

type UseGoogleAuthOptions = {
  /** Where to land after Google. The backend validates it. */
  next?: string;
  /** Connect Google to the signed-in account instead of signing in with it. */
  link?: boolean;
  /** Called when starting the flow fails (mocks only: a real failure happens after leaving). */
  onError?: () => void;
};

/**
 * Starts the Google flow. With a real backend it leaves the page, so `isPending` stays on until the
 * browser navigates. With mocks there is no OAuth, so the redirect is read from MSW and followed.
 */
export function useGoogleAuth({ next, link = false, onError }: UseGoogleAuthOptions = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  function start() {
    setIsPending(true);
    setHasFailed(false);
    if (!env.apiMocking) {
      window.location.assign(getGoogleUrl({ next, link }));
      return;
    }
    fetchMockGoogleRedirect({ next, link }).then(
      ({ redirectTo }) => {
        void queryClient.invalidateQueries({ queryKey: profileKeys.all });
        setIsPending(false);
        router.replace(redirectTo as "/");
      },
      () => {
        setIsPending(false);
        setHasFailed(true);
        onError?.();
      },
    );
  }

  return { start, isPending, hasFailed };
}
