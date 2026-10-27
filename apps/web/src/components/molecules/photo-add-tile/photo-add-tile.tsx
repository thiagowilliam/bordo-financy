"use client";

import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";

import { ACCEPTED_PHOTO_TYPES } from "@/lib/photos";
import { cn } from "@/lib/utils";

export type PhotoAddTileProps = Omit<
  React.ComponentProps<"div">,
  "children" | "onDrop" | "onDragOver" | "onDragLeave"
> & {
  /** Called with the files chosen in the picker or dropped on the tile. */
  onFiles: (files: File[]) => void;
  disabled?: boolean;
};

/** Tile that opens the file picker and also accepts dropped files. */
export function PhotoAddTile({ onFiles, disabled, className, ...props }: PhotoAddTileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={cn("relative min-h-24", className)}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (!disabled) onFiles(Array.from(event.dataTransfer.files));
      }}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_PHOTO_TYPES.join(",")}
        aria-hidden="true"
        tabIndex={-1}
        data-testid="photo-add-input"
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          // Allows picking the same file again.
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex size-full flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary bg-primary-soft transition-colors outline-none hover:bg-primary-soft/70 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:gap-2.5 md:rounded-2xl",
          isDragging && "border-primary-strong bg-primary-soft/60",
        )}
      >
        <span className="flex items-center justify-center text-primary md:size-12 md:rounded-lg md:bg-card">
          <ImagePlus aria-hidden="true" className="size-6.5 md:size-6" />
        </span>
        <span className="text-sm font-bold text-primary-strong md:text-[15px]">
          Adicionar fotos
        </span>
        <span className="text-[13px] text-muted-foreground max-md:hidden">
          Arraste e solte aqui
        </span>
      </button>
    </div>
  );
}
