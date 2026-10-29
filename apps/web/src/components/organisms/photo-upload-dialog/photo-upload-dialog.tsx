"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  cropImageToBlob,
  CropPreview,
  INITIAL_CROP,
  PhotoCropper,
  type CropState,
} from "@/components/molecules/photo-cropper";
import { ResponsiveModal } from "@/components/organisms/responsive-modal";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { isValidAvatarFile } from "@/lib/photos";
import { cn } from "@/lib/utils";

export type PhotoUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shows the "Remover foto" button on the first step. */
  hasPhoto: boolean;
  /** Receives the cropped square image (JPEG, 512 px). */
  onSave: (photo: File) => void;
  onRemove: () => void;
  isPending?: boolean;
  /** Server error shown in the dialog. */
  error?: string;
};

const INVALID_FILE_MESSAGE = "Use JPG, PNG ou WEBP de até 5 MB.";

type Chosen = { file: File; url: string };

const textButtonClassName = "h-auto px-3 py-2.5 text-sm font-bold";
const footerButtonClassName = "h-auto flex-1 px-6 py-3.5 text-base font-bold md:flex-none md:px-7";

type PhotoUploadFormProps = Omit<PhotoUploadDialogProps, "open" | "onOpenChange">;

function PhotoUploadForm({
  hasPhoto,
  onSave,
  onRemove,
  isPending = false,
  error,
}: PhotoUploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const [crop, setCrop] = useState<CropState>(INITIAL_CROP);
  const [fileError, setFileError] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const chosenUrl = chosen?.url;
  useEffect(() => {
    if (!chosenUrl) return;
    return () => URL.revokeObjectURL(chosenUrl);
  }, [chosenUrl]);

  const busy = isPending || isCropping;
  const message = error ?? fileError;

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (!isValidAvatarFile(file)) {
      setFileError(INVALID_FILE_MESSAGE);
      return;
    }
    setFileError(undefined);
    setCrop(INITIAL_CROP);
    setChosen({ file, url: URL.createObjectURL(file) });
  };

  const handleSave = async () => {
    if (!chosen || busy) return;
    setIsCropping(true);
    try {
      const blob = await cropImageToBlob(chosen.url, crop);
      onSave(new File([blob], "avatar.jpg", { type: blob.type || "image/jpeg" }));
    } catch {
      setFileError("Não foi possível processar a imagem. Tente outra.");
    } finally {
      setIsCropping(false);
    }
  };

  const saveButton = (
    <Button
      type="button"
      disabled={!chosen || busy}
      onClick={handleSave}
      className={footerButtonClassName}
    >
      {busy ? "Salvando..." : "Salvar foto"}
    </Button>
  );
  const cancelButton = (
    <DialogClose asChild>
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        className={cn(footerButtonClassName, "border-border bg-card")}
      >
        Cancelar
      </Button>
    </DialogClose>
  );

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <DialogTitle className="text-xl leading-tight font-bold tracking-[-0.3px] text-foreground md:text-[22px]">
            {chosen ? "Ajustar foto" : "Trocar foto"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {chosen
              ? "Arraste para reposicionar e use o zoom para enquadrar."
              : "Escolha uma imagem para o seu perfil."}
          </DialogDescription>
        </div>
        <DialogClose
          aria-label="Fechar"
          disabled={busy}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <X aria-hidden className="size-4" />
        </DialogClose>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Arquivo de imagem"
        tabIndex={-1}
        disabled={busy}
        className="sr-only"
        onChange={(event) => {
          handleFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {chosen ? (
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-7">
          <PhotoCropper
            key={chosen.url}
            src={chosen.url}
            onCropChange={setCrop}
            className="w-full md:w-75 md:shrink-0"
          />
          <div className="flex min-w-0 flex-1 flex-col items-center gap-3.5 md:items-start">
            <span className="text-[11px] font-bold tracking-[0.8px] text-subtle-foreground">
              PRÉVIA
            </span>
            <CropPreview src={chosen.url} crop={crop} className="size-28" />
            <div className="flex items-center gap-2.5">
              <CropPreview src={chosen.url} crop={crop} className="size-10" />
              <CropPreview src={chosen.url} crop={crop} className="size-7" />
            </div>
            <p className="text-center text-[13px] text-muted-foreground md:text-left">
              É assim que sua foto aparece no perfil e no menu.
            </p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (!busy) handleFiles(Array.from(event.dataTransfer.files));
          }}
          className={cn(
            "flex flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-primary bg-primary-soft px-6 py-8 text-center transition-colors",
            isDragging && "border-solid bg-primary-soft/60",
          )}
        >
          <span className="text-[17px] font-bold text-foreground">Arraste uma imagem aqui</span>
          <span className="text-[13px] text-muted-foreground">ou</span>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="h-auto border-border bg-card px-5 py-2.5 text-sm font-bold"
          >
            Escolher arquivo
          </Button>
          <span className="text-[13px] text-muted-foreground">JPG, PNG ou WEBP, até 5 MB</span>
        </div>
      )}

      {message ? (
        <p role="alert" className="text-[13px] text-destructive-ink">
          {message}
        </p>
      ) : null}

      <footer className="flex flex-col-reverse gap-2 pt-1 md:flex-row md:items-center">
        <div className="md:mr-auto">
          {chosen ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setChosen(null);
                setFileError(undefined);
              }}
              className={cn(textButtonClassName, "text-primary max-md:w-full")}
            >
              Escolher outra
            </Button>
          ) : hasPhoto ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={onRemove}
              className={cn(
                textButtonClassName,
                "text-destructive-ink hover:bg-destructive-soft hover:text-destructive-ink max-md:w-full",
              )}
            >
              Remover foto
            </Button>
          ) : null}
        </div>
        <div className="flex gap-2 md:gap-3">
          {cancelButton}
          {saveButton}
        </div>
      </footer>
    </div>
  );
}

/** Two-step avatar dialog: choose an image, then frame it. State resets each time it closes. */
export function PhotoUploadDialog({ open, onOpenChange, ...formProps }: PhotoUploadDialogProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      locked={formProps.isPending}
      desktopClassName="sm:max-w-[600px]"
    >
      <PhotoUploadForm {...formProps} />
    </ResponsiveModal>
  );
}
