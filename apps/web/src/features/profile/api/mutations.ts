import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteProfile,
  fetchExpensesExport,
  removeProfilePhoto,
  requestEmailChange,
  requestPasswordReset,
  updateProfile,
  uploadProfilePhoto,
} from "./client";
import { profileKeys } from "./keys";

/** Every mutation that returns the profile also refreshes it, so the sidebar follows. */
function useProfileMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.detail() }),
  });
}

export const useUpdateProfile = () => useProfileMutation(updateProfile);

export const useUploadProfilePhoto = () => useProfileMutation(uploadProfilePhoto);

export const useRemoveProfilePhoto = () => useProfileMutation(removeProfilePhoto);

export const useRequestEmailChange = () => useMutation({ mutationFn: requestEmailChange });

export const useRequestPasswordReset = () => useMutation({ mutationFn: requestPasswordReset });

export const useExportExpenses = () => useMutation({ mutationFn: fetchExpensesExport });

export const useDeleteProfile = () => useMutation({ mutationFn: deleteProfile });
