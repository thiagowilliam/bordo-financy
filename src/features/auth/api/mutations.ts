import { useMutation, useQueryClient } from "@tanstack/react-query";

import { profileKeys } from "@/features/profile/api/keys";

import { requestPasswordRecovery, resetPassword, signIn, signOut, signUp } from "./client";
import { authKeys } from "./keys";

/** The sign-in answer is the user, so the profile cache starts warm for the app shell. */
function useSessionStart<TVariables>(
  mutationFn: (variables: TVariables) => ReturnType<typeof signIn>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.session(), user);
      queryClient.setQueryData(profileKeys.detail(), user);
    },
  });
}

export const useSignIn = () => useSessionStart(signIn);

export const useSignUp = () => useSessionStart(signUp);

/** Drops every cached query: nothing from the previous user may stay on screen. */
export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: signOut, onSuccess: () => queryClient.clear() });
}

export const useRequestPasswordRecovery = () =>
  useMutation({ mutationFn: requestPasswordRecovery });

export const useResetPassword = () => useMutation({ mutationFn: resetPassword });
