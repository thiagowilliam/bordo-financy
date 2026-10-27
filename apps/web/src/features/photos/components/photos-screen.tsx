"use client";

import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/molecules/page-header";
import { ConfirmDialog } from "@/components/organisms/confirm-dialog";
import { PhotoGallery } from "@/components/organisms/photo-gallery";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrip } from "@/features/trips/api/queries";
import { TripTopBar } from "@/features/trips/components/trip-top-bar";
import { ACCEPTED_PHOTO_TYPES, filterPhotoFiles, MAX_PHOTOS } from "@/lib/photos";

import { useDeletePhoto, useSetCoverPhoto, useUploadPhotos } from "../api/mutations";
import { usePhotos } from "../api/queries";

export type PhotosScreenProps = {
  tripId: string;
};

const INVALID_MESSAGE = "Algumas fotos foram ignoradas: use JPG ou PNG de até 10 MB.";
const OVERFLOW_MESSAGE = `Você pode ter até ${MAX_PHOTOS} fotos na viagem.`;

const photoCountLabel = (count: number) => `${count} ${count === 1 ? "foto" : "fotos"}`;

function GallerySkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando fotos"
      className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-5"
    >
      <Skeleton className="col-span-2 h-57.5 rounded-xl md:col-span-4 md:h-95 md:rounded-2xl" />
      <Skeleton className="h-42.75 rounded-xl md:h-57.5 md:rounded-2xl" />
      <Skeleton className="h-42.75 rounded-xl md:h-57.5 md:rounded-2xl" />
    </div>
  );
}

/** "Fotos": the trip gallery. The first photo is the cover shown in "Minhas viagens". */
export function PhotosScreen({ tripId }: PhotosScreenProps) {
  const trip = useTrip(tripId);
  const photos = usePhotos(tripId);
  const upload = useUploadPhotos(tripId);
  const setCover = useSetCoverPhoto(tripId);
  const remove = useDeletePhoto(tripId);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = photos.data ?? [];
  const canAdd = list.length < MAX_PHOTOS;

  function handleAddFiles(files: File[]) {
    if (files.length === 0 || upload.isPending) return;
    const { accepted, hasInvalid, hasOverflow } = filterPhotoFiles(files, list.length);
    if (hasInvalid) toast.error(INVALID_MESSAGE);
    else if (hasOverflow) toast.error(OVERFLOW_MESSAGE);
    if (accepted.length === 0) return;
    upload.mutate(accepted, {
      onSuccess: () =>
        toast.success(accepted.length === 1 ? "Foto adicionada" : "Fotos adicionadas"),
      onError: () => toast.error("Não foi possível enviar as fotos. Tente de novo."),
    });
  }

  function handleSetCover(photoId: string) {
    setCover.mutate(photoId, {
      onSuccess: () => toast.success("Capa atualizada"),
      onError: () => toast.error("Não foi possível trocar a capa. Tente de novo."),
    });
  }

  function handleDelete() {
    if (!deletingId) return;
    remove.mutate(deletingId, {
      onSuccess: () => {
        toast.success("Foto excluída");
        setDeletingId(null);
      },
      onError: () => toast.error("Não foi possível excluir a foto. Tente de novo."),
    });
  }

  if (trip.isError || photos.isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center"
      >
        <p className="text-base text-foreground">Não foi possível carregar as fotos.</p>
        <Button
          variant="outline"
          onClick={() => {
            if (trip.isError) void trip.refetch();
            if (photos.isError) void photos.refetch();
          }}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  const isLoading = !trip.data || !photos.data;
  const hasCover = list.some((photo) => photo.isCover);
  const addButtonLabel = "Adicionar fotos";

  return (
    <div className="flex flex-col gap-4.5 md:gap-7">
      <TripTopBar tripName={trip.data?.name ?? ""} />

      <PageHeader
        title="Fotos"
        eyebrow={trip.data?.name ?? "\u00a0"}
        eyebrowClassName="md:hidden"
        subtitle={
          isLoading
            ? "\u00a0"
            : list.length > 0
              ? `${photoCountLabel(list.length)} da viagem · a capa aparece em Minhas viagens.`
              : "Adicione fotos da viagem · a capa aparece em Minhas viagens."
        }
        subtitleClassName="hidden md:block"
        action={
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={!canAdd || isLoading}
            className="hidden h-auto gap-2 rounded-lg px-5.5 py-3.25 text-base font-bold md:inline-flex [&_svg:not([class*='size-'])]:size-4.5"
          >
            <ImagePlus aria-hidden="true" />
            {addButtonLabel}
          </Button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        aria-hidden="true"
        tabIndex={-1}
        accept={ACCEPTED_PHOTO_TYPES.join(",")}
        data-testid="photos-header-input"
        onChange={(event) => {
          handleAddFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {!isLoading ? (
        <div className="flex items-center justify-between gap-3 md:hidden">
          <p className="text-sm text-muted-foreground">
            {photoCountLabel(list.length)}
            {hasCover ? " · capa definida" : ""}
          </p>
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={!canAdd}
            className="h-auto gap-2 rounded-lg bg-card px-4 py-2.5 text-sm font-bold"
          >
            <ImagePlus aria-hidden="true" />
            {addButtonLabel}
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <GallerySkeleton />
      ) : (
        <PhotoGallery
          photos={list.map((photo) => ({
            id: photo.id,
            url: photo.url,
            alt: photo.name.replace(/\.[^.]+$/, ""),
            isCover: photo.isCover,
          }))}
          canAdd={canAdd}
          onAddFiles={handleAddFiles}
          onSetCover={handleSetCover}
          onDelete={setDeletingId}
        />
      )}

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Excluir foto?"
        description={
          list.find((photo) => photo.id === deletingId)?.isCover && list.length > 1
            ? "Essa foto é a capa da viagem. A próxima foto vira a capa."
            : "Essa ação não pode ser desfeita."
        }
        onConfirm={handleDelete}
        isPending={remove.isPending}
      />
    </div>
  );
}
