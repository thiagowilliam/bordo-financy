"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/molecules/page-header";
import { AccessMethodsSection } from "@/components/organisms/access-methods-section";
import { ChangeEmailDialog } from "@/components/organisms/change-email-dialog";
import { DangerZone } from "@/components/organisms/danger-zone";
import { DataSection } from "@/components/organisms/data-section";
import { DeleteAccountDialog } from "@/components/organisms/delete-account-dialog";
import { PhotoUploadDialog } from "@/components/organisms/photo-upload-dialog";
import { ProfileHeaderCard } from "@/components/organisms/profile-header-card";
import { ProfileInfoSection } from "@/components/organisms/profile-info-section";
import { TravelerHistory } from "@/components/organisms/traveler-history";
import { UnsavedChangesBar } from "@/components/organisms/unsaved-changes-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { selectSetHasUnsavedChanges, useUnsavedChangesStore } from "@/stores/unsaved-changes";

import {
  useDeleteProfile,
  useExportExpenses,
  useRemoveProfilePhoto,
  useRequestEmailChange,
  useRequestPasswordReset,
  useUpdateProfile,
  useUploadProfilePhoto,
} from "../api/mutations";
import { useGoogleAuth } from "@/features/auth/hooks/use-google-auth";
import { useProfile, useProfileStats } from "../api/queries";
import { updateProfileSchema } from "@bordo/shared/profile";
import type { UpdateProfileInput } from "../types";
import { downloadFile } from "../utils/download-file";
import { formatMemberSince } from "../utils/profile-dates";

type Dialog = "photo" | "email" | "delete" | null;

function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando perfil"
      className="flex flex-col gap-5"
    >
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

type ProfileScreenProps = {
  /** The backend sent the browser back from Google with `?google=error`. */
  googleError?: boolean;
};

/** "Perfil": account data, traveler history, security, data export and account deletion. */
export function ProfileScreen({ googleError = false }: ProfileScreenProps) {
  const router = useRouter();
  const profile = useProfile();
  const stats = useProfileStats();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [passwordLinkSent, setPasswordLinkSent] = useState(false);
  const [emailError, setEmailError] = useState<string>();

  const updateMutation = useUpdateProfile();
  const uploadPhoto = useUploadProfilePhoto();
  const removePhoto = useRemoveProfilePhoto();
  const emailChange = useRequestEmailChange();
  const passwordReset = useRequestPasswordReset();
  const exportExpenses = useExportExpenses();
  const deleteAccount = useDeleteProfile();
  const googleLink = useGoogleAuth({
    next: "/perfil",
    link: true,
    onError: () => toast.error("Não foi possível conectar o Google. Tente de novo."),
  });

  // `values` keeps the form in sync with the server: it resets (and stops being dirty) after a save.
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: profile.data ? { name: profile.data.name, currency: profile.data.currency } : undefined,
  });
  const { isDirty, errors } = form.formState;

  // The account menu asks before signing out with unsaved edits. Clear the flag when leaving.
  const setHasUnsavedChanges = useUnsavedChangesStore(selectSetHasUnsavedChanges);
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
    return () => setHasUnsavedChanges(false);
  }, [isDirty, setHasUnsavedChanges]);

  // Connecting Google is a full page trip, so its failure arrives in the URL. Say it once, then
  // drop the param so a refresh does not repeat the toast.
  useEffect(() => {
    if (!googleError) return;
    toast.error("Não foi possível conectar o Google. Tente de novo.");
    router.replace("/perfil");
  }, [googleError, router]);
  const name = useWatch({ control: form.control, name: "name" }) ?? "";
  const watchedCurrency = useWatch({ control: form.control, name: "currency" });
  const currency = watchedCurrency ?? profile.data?.currency;

  if (profile.isError || stats.isError) {
    return (
      <div role="alert" className="flex max-w-180 flex-col items-start gap-3">
        <p className="text-foreground">Não foi possível carregar o seu perfil.</p>
        <Button
          variant="outline"
          onClick={() => {
            if (profile.isError) void profile.refetch();
            if (stats.isError) void stats.refetch();
          }}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  const closeDialog = () => {
    setDialog(null);
    setEmailError(undefined);
  };

  function handleExport() {
    exportExpenses.mutate(undefined, {
      onSuccess: (file) => downloadFile(file, "bordo-gastos.csv"),
      onError: () => toast.error("Não foi possível exportar seus dados. Tente de novo."),
    });
  }

  const save = form.handleSubmit((values) =>
    updateMutation.mutateAsync(values).then(
      () => void toast.success("Perfil atualizado"),
      () => void toast.error("Não foi possível salvar as alterações. Tente de novo."),
    ),
  );

  return (
    <div className="flex w-full max-w-180 flex-col gap-5 pb-24">
      <PageHeader
        title="Perfil"
        subtitle="Suas informações e sua conta."
        subtitleClassName="text-sm md:text-base"
      />
      {profile.data && stats.data && currency ? (
        <>
          <ProfileHeaderCard
            name={profile.data.name}
            email={profile.data.email}
            photoUrl={profile.data.photoUrl}
            memberSince={formatMemberSince(profile.data.createdAt)}
            onChangePhoto={() => setDialog("photo")}
          />
          <TravelerHistory
            trips={stats.data.trips}
            daysTraveled={stats.data.daysTraveled}
            destinations={stats.data.destinations}
            total={{ amountInCents: stats.data.totalInCents, currency: profile.data.currency }}
          />
          <ProfileInfoSection
            name={name}
            onNameChange={(value) => form.setValue("name", value, { shouldDirty: true })}
            nameError={errors.name?.message}
            currency={currency}
            onCurrencyChange={(value) => form.setValue("currency", value, { shouldDirty: true })}
            email={profile.data.email}
            emailVerified={profile.data.emailVerified}
            onChangeEmail={() => setDialog("email")}
            disabled={updateMutation.isPending}
          />
          <AccessMethodsSection
            googleEmail={profile.data.googleEmail}
            hasPassword={profile.data.hasPassword}
            email={profile.data.email}
            onConnectGoogle={googleLink.start}
            isConnectingGoogle={googleLink.isPending}
            linkSent={passwordLinkSent}
            isSending={passwordReset.isPending}
            onSendPasswordLink={() =>
              passwordReset.mutate(undefined, {
                onSuccess: () => setPasswordLinkSent(true),
                onError: () => toast.error("Não foi possível enviar o link. Tente de novo."),
              })
            }
          />
          <DataSection onExport={handleExport} isExporting={exportExpenses.isPending} />
          <DangerZone className="mt-4 md:mt-7" onDelete={() => setDialog("delete")} />

          <UnsavedChangesBar
            visible={isDirty}
            isSaving={updateMutation.isPending}
            onDiscard={() => form.reset()}
            onSave={() => void save()}
          />

          <PhotoUploadDialog
            open={dialog === "photo"}
            onOpenChange={(open) => !open && closeDialog()}
            hasPhoto={profile.data.photoUrl !== null}
            isPending={uploadPhoto.isPending || removePhoto.isPending}
            onSave={(photo) =>
              uploadPhoto.mutate(photo, {
                onSuccess: () => {
                  closeDialog();
                  toast.success("Foto atualizada");
                },
                onError: () => toast.error("Não foi possível salvar a foto. Tente de novo."),
              })
            }
            onRemove={() =>
              removePhoto.mutate(undefined, {
                onSuccess: () => {
                  closeDialog();
                  toast.success("Foto removida");
                },
                onError: () => toast.error("Não foi possível remover a foto. Tente de novo."),
              })
            }
          />
          <ChangeEmailDialog
            open={dialog === "email"}
            onOpenChange={(open) => !open && closeDialog()}
            currentEmail={profile.data.email}
            isPending={emailChange.isPending}
            error={emailError}
            onSubmit={(email) => {
              setEmailError(undefined);
              emailChange.mutate(email, {
                onSuccess: () => {
                  closeDialog();
                  toast.success(`Link de confirmação enviado para ${email}`);
                },
                onError: () => setEmailError("Não foi possível enviar o link. Tente de novo."),
              });
            }}
          />
          <DeleteAccountDialog
            open={dialog === "delete"}
            onOpenChange={(open) => !open && closeDialog()}
            tripCount={stats.data.trips}
            onExport={handleExport}
            isExporting={exportExpenses.isPending}
            isPending={deleteAccount.isPending}
            onConfirm={() =>
              deleteAccount.mutate(undefined, {
                onSuccess: () => {
                  toast.success("Conta excluída");
                  router.replace("/");
                },
                onError: () => toast.error("Não foi possível excluir a conta. Tente de novo."),
              })
            }
          />
        </>
      ) : (
        <ProfileSkeleton />
      )}
    </div>
  );
}
