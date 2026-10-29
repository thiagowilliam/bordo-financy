"use client";

import { Plus, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PhotoDropzone } from "@/components/molecules/photo-dropzone";
import { PhotoThumbnail } from "@/components/molecules/photo-thumbnail";
import { filterPhotoFiles, MAX_PHOTOS } from "@/lib/photos";
import { cn } from "@/lib/utils";

type Photo = { id: string; name: string; url: string };

export type PhotoPickerProps = Omit<React.ComponentProps<"div">, "children" | "onChange"> & {
  /** Called whenever the selection changes, with the files in order and the cover index. */
  onChange?: (selection: { files: File[]; coverIndex: number }) => void;
  /** How many photos can be picked. Defaults to the trip limit; 1 hides the cover choice hint. */
  maxPhotos?: number;
};

const INVALID_MESSAGE = "Algumas fotos foram ignoradas: use JPG ou PNG de até 10 MB.";
const overflowMessage = (max: number) =>
  max === 1 ? "Escolha apenas uma foto de capa." : `Você pode adicionar até ${max} fotos.`;

/**
 * Photo selection with drag and drop, previews and cover choice. Photos only live in the
 * browser: nothing is uploaded.
 */
export function PhotoPicker({
  onChange,
  maxPhotos = MAX_PHOTOS,
  className,
  ...props
}: PhotoPickerProps) {
  const [photos, setPhotos] = useState<(Photo & { file: File })[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    },
    [],
  );

  const effectiveCoverId = coverId ?? photos[0]?.id ?? null;

  function notify(next: typeof photos, nextCoverId: string | null) {
    const coverIndex = Math.max(
      0,
      next.findIndex((photo) => photo.id === nextCoverId),
    );
    onChange?.({ files: next.map((photo) => photo.file), coverIndex });
  }

  function handleFiles(files: File[]) {
    if (files.length === 0) return;
    const { accepted, hasInvalid, hasOverflow } = filterPhotoFiles(files, photos.length, maxPhotos);
    setError(hasInvalid ? INVALID_MESSAGE : hasOverflow ? overflowMessage(maxPhotos) : null);
    if (accepted.length === 0) return;
    const added = accepted.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    const next = [...photos, ...added];
    setPhotos(next);
    notify(next, effectiveCoverId ?? added[0].id);
  }

  function handleRemove(id: string) {
    const removed = photos.find((photo) => photo.id === id);
    if (!removed) return;
    URL.revokeObjectURL(removed.url);
    const next = photos.filter((photo) => photo.id !== id);
    // Removing the cover promotes the photo that took its place (the next one, or the last).
    const removedIndex = photos.indexOf(removed);
    const nextCoverId =
      effectiveCoverId === id
        ? ((next[removedIndex] ?? next[next.length - 1])?.id ?? null)
        : coverId;
    setPhotos(next);
    setCoverId(nextCoverId);
    setError(null);
    notify(next, nextCoverId ?? next[0]?.id ?? null);
  }

  function handleSetCover(id: string) {
    setCoverId(id);
    notify(photos, id);
  }

  const isFull = photos.length >= maxPhotos;

  return (
    <div className={cn("flex flex-col gap-3.5", className)} {...props}>
      <PhotoDropzone
        inputRef={inputRef}
        onFilesSelected={handleFiles}
        disabled={isFull}
        multiple={maxPhotos > 1}
      />
      {error ? (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
      {photos.length > 0 ? (
        <>
          <ul className="grid grid-cols-4 gap-2.5 md:gap-3.5">
            {photos.map((photo) => (
              <li key={photo.id}>
                <PhotoThumbnail
                  src={photo.url}
                  alt={photo.name}
                  isCover={photo.id === effectiveCoverId}
                  onSetCover={() => handleSetCover(photo.id)}
                  onRemove={() => handleRemove(photo.id)}
                />
              </li>
            ))}
            {isFull ? null : (
              <li>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex h-20.5 w-full items-center justify-center rounded-xl border border-border bg-card text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 md:h-27.5"
                >
                  <Plus aria-hidden="true" className="size-6" />
                  <span className="sr-only">Adicionar mais fotos</span>
                </button>
              </li>
            )}
          </ul>
          <p
            hidden={maxPhotos === 1}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground md:hidden"
          >
            <Star aria-hidden="true" className="size-3.5 shrink-0" />A foto com a estrela marcada
            será a capa da viagem
          </p>
        </>
      ) : null}
    </div>
  );
}
