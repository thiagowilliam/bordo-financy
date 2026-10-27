"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type PhotoDropzoneProps = Omit<
  React.ComponentProps<"label">,
  "onChange" | "onDrop" | "children"
> & {
  /** Called with the files chosen in the picker or dropped on the area. */
  onFilesSelected: (files: File[]) => void;
  /** Ref of the real file input, so other controls can open the picker. */
  inputRef?: React.Ref<HTMLInputElement>;
  disabled?: boolean;
};

/** Drop area backed by a real `<input type="file">`, so click and keyboard work. */
export function PhotoDropzone({
  onFilesSelected,
  inputRef,
  disabled,
  className,
  ...props
}: PhotoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-primary bg-primary-soft px-6 py-8 text-center transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
        isDragging && "border-solid bg-primary-soft/60",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (!disabled) onFilesSelected(Array.from(event.dataTransfer.files));
      }}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png"
        aria-label="Escolher fotos"
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          onFilesSelected(Array.from(event.target.files ?? []));
          // Allows picking the same file again after removing it.
          event.target.value = "";
        }}
      />
      <span className="flex size-13 items-center justify-center rounded-xl bg-card text-primary">
        <Upload aria-hidden="true" className="size-6" />
      </span>
      <span className="text-[15px] font-bold text-primary-strong md:text-base">
        <span className="md:hidden">Toque para escolher fotos</span>
        <span className="max-md:hidden">Arraste e solte suas fotos aqui</span>
      </span>
      <span className="text-[13px] text-muted-foreground">
        <span className="md:hidden">ou arraste e solte aqui · JPG ou PNG até 10 MB</span>
        <span className="max-md:hidden">ou escolha no computador · JPG ou PNG até 10 MB cada</span>
      </span>
    </label>
  );
}
