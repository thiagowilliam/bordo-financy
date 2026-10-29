import { Star, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type PhotoThumbnailProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Object URL or any image URL. */
  src: string;
  alt: string;
  isCover: boolean;
  onSetCover: () => void;
  /** Omit to hide the remove button, e.g. when only the cover can be changed. */
  onRemove?: () => void;
};

/** Preview of a photo with an optional remove and "set as cover" controls. */
export function PhotoThumbnail({
  src,
  alt,
  isCover,
  onSetCover,
  onRemove,
  className,
  ...props
}: PhotoThumbnailProps) {
  return (
    <div
      className={cn(
        "relative h-20.5 overflow-hidden rounded-xl bg-muted md:h-27.5",
        isCover && "ring-3 ring-primary",
        className,
      )}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- blob preview, next/image cannot optimize it */}
      <img src={src} alt={alt} className="size-full object-cover" />
      {onRemove ? (
        <button
          type="button"
          aria-label="Remover foto"
          onClick={onRemove}
          className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-card text-foreground shadow-float outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
      {isCover ? (
        <span className="absolute right-1.5 bottom-1.5 flex size-6 items-center justify-center gap-1 rounded-full bg-primary text-[11px] font-bold text-primary-foreground md:h-auto md:w-auto md:px-2.5 md:py-1">
          <Star aria-hidden="true" className="size-3 fill-current" />
          <span className="sr-only md:not-sr-only">Capa</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={onSetCover}
          className="absolute right-1.5 bottom-1.5 flex size-6 items-center justify-center gap-1 rounded-full bg-card text-[11px] font-bold text-foreground shadow-float outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 md:h-auto md:w-auto md:px-2.5 md:py-1"
        >
          <Star aria-hidden="true" className="size-3" />
          <span className="sr-only md:not-sr-only">Definir capa</span>
        </button>
      )}
    </div>
  );
}
