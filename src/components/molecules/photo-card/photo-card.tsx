"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Ellipsis, Star, Trash2 } from "lucide-react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const photoCardVariants = cva("group/photo relative overflow-hidden bg-secondary", {
  variants: {
    size: {
      cover: "h-57.5 rounded-2xl md:h-95",
      stack: "h-42.75 rounded-xl md:h-45 md:rounded-2xl",
      grid: "h-42.75 rounded-xl md:h-57.5 md:rounded-2xl",
    },
  },
  defaultVariants: { size: "grid" },
});

export type PhotoCardProps = Omit<React.ComponentProps<"div">, "children"> &
  VariantProps<typeof photoCardVariants> & {
    /** Image URL (remote or blob:). */
    src: string;
    /** Meaningful description of the photo, provided by the caller. */
    alt: string;
    size: "cover" | "stack" | "grid";
    isCover?: boolean;
    onSetCover?: () => void;
    onDelete?: () => void;
  };

const SIZES = {
  cover: "(min-width: 768px) 800px, 100vw",
  stack: "(min-width: 768px) 340px, 50vw",
  grid: "(min-width: 768px) 260px, 50vw",
} as const;

/** Photo tile with a cover badge, a "more" menu and a hover "set as cover" shortcut. */
export function PhotoCard({
  src,
  alt,
  size,
  isCover = false,
  onSetCover,
  onDelete,
  className,
  ...props
}: PhotoCardProps) {
  return (
    <div className={cn(photoCardVariants({ size }), className)} {...props}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={SIZES[size]}
        unoptimized={src.startsWith("blob:")}
        className="object-cover"
      />
      {isCover ? (
        <span className="absolute top-3 left-3 flex h-7.5 items-center gap-1.5 rounded-full bg-card/92 px-3 text-xs font-bold text-foreground md:top-4.5 md:left-4.5 md:px-3.5 md:text-[13px]">
          <Star aria-hidden="true" className="size-3.5 fill-cta text-cta md:size-3.75" />
          Capa da viagem
        </span>
      ) : (
        <button
          type="button"
          onClick={onSetCover}
          className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 rounded-full bg-card/95 px-3.25 py-2 text-[13px] leading-4 font-bold text-foreground transition-opacity outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-md:hidden md:opacity-0 md:group-focus-within/photo:opacity-100 md:group-hover/photo:opacity-100"
        >
          <Star aria-hidden="true" className="size-3.5" />
          Definir como capa
        </button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Mais opções da foto"
            className={cn(
              "absolute flex size-8 items-center justify-center rounded-full bg-card/92 text-foreground outline-none hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-card md:top-3.5 md:right-3.5 md:size-8.5",
              size === "cover" ? "top-3 right-3" : "top-2.5 right-2.5",
            )}
          >
            <Ellipsis aria-hidden="true" className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isCover ? null : (
            <DropdownMenuItem onSelect={() => onSetCover?.()}>
              <Star aria-hidden="true" />
              Definir como capa
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete?.()}>
            <Trash2 aria-hidden="true" />
            Excluir foto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
