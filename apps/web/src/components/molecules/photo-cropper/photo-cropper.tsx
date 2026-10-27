"use client";

import { ImageIcon } from "lucide-react";
import { useId, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

import {
  clampCrop,
  getDisplaySize,
  INITIAL_CROP,
  MAX_ZOOM,
  MIN_ZOOM,
  type CropState,
  type ImageSize,
} from "./crop-math";

const KEY_STEP = 0.02;
const ZOOM_STEP = 0.1;

function getImageStyle(image: ImageSize, crop: CropState): CSSProperties {
  const safe = clampCrop(crop, image);
  const display = getDisplaySize(image, safe.zoom);
  return {
    width: `${display.width * 100}%`,
    height: `${display.height * 100}%`,
    left: `${(0.5 + safe.x) * 100}%`,
    top: `${(0.5 + safe.y) * 100}%`,
  };
}

export type CropPreviewProps = Omit<React.ComponentProps<"span">, "children"> & {
  src: string;
  crop: CropState;
};

/** Circular preview of the framed region. Decorative. */
export function CropPreview({ src, crop, className, ...props }: CropPreviewProps) {
  const [image, setImage] = useState<ImageSize | null>(null);
  return (
    <span
      aria-hidden="true"
      className={cn("relative block overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL with computed layout */}
      <img
        src={src}
        alt=""
        draggable={false}
        onLoad={(event) =>
          setImage({
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight,
          })
        }
        style={image ? getImageStyle(image, crop) : undefined}
        className={cn(
          "absolute max-w-none -translate-x-1/2 -translate-y-1/2 object-cover",
          !image && "inset-0 size-full opacity-0",
        )}
      />
    </span>
  );
}

export type PhotoCropperProps = Omit<React.ComponentProps<"div">, "children" | "onChange"> & {
  src: string;
  /** Called every time the framing changes (drag, keyboard or zoom slider). */
  onCropChange?: (crop: CropState) => void;
  /** Initial framing. Remount (e.g. `key={src}`) to reset. */
  defaultCrop?: CropState;
};

/** Square stage with a circular mask: drag, arrow keys, +/- and the zoom slider frame the image. */
export function PhotoCropper({
  src,
  onCropChange,
  defaultCrop = INITIAL_CROP,
  className,
  ...props
}: PhotoCropperProps) {
  const hintId = useId();
  const [crop, setCrop] = useState<CropState>(defaultCrop);
  const [image, setImage] = useState<ImageSize | null>(null);
  const [drag, setDrag] = useState<{ pointerX: number; pointerY: number; size: number } | null>(
    null,
  );

  const update = (next: CropState) => {
    const safe = image
      ? clampCrop(next, image)
      : { ...next, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.zoom)) };
    setCrop(safe);
    onCropChange?.(safe);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const size = event.currentTarget.getBoundingClientRect().width;
    if (size <= 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ pointerX: event.clientX, pointerY: event.clientY, size });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    update({
      ...crop,
      x: crop.x + (event.clientX - drag.pointerX) / drag.size,
      y: crop.y + (event.clientY - drag.pointerY) / drag.size,
    });
    setDrag({ ...drag, pointerX: event.clientX, pointerY: event.clientY });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      update({ ...crop, x: crop.x + move[0], y: crop.y + move[1] });
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      update({ ...crop, zoom: crop.zoom + ZOOM_STEP });
    } else if (event.key === "-") {
      event.preventDefault();
      update({ ...crop, zoom: crop.zoom - ZOOM_STEP });
    }
  };

  return (
    <div className={cn("flex flex-col gap-3.5", className)} {...props}>
      <div
        role="group"
        tabIndex={0}
        aria-label="Área de enquadramento da foto"
        aria-describedby={hintId}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
        className={cn(
          "relative aspect-square w-full touch-none overflow-hidden rounded-xl bg-foreground outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
          drag ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL with computed layout */}
        <img
          src={src}
          alt=""
          draggable={false}
          onLoad={(event) =>
            setImage({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })
          }
          style={image ? getImageStyle(image, crop) : undefined}
          className={cn(
            "absolute max-w-none -translate-x-1/2 -translate-y-1/2 object-cover",
            !image && "inset-0 size-full opacity-0",
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[6%] rounded-full border-2 border-card shadow-[0_0_0_999px_color-mix(in_oklch,var(--foreground)_55%,transparent)]"
        />
      </div>
      <p id={hintId} className="sr-only">
        Use as setas para mover a foto e as teclas + e - para ajustar o zoom.
      </p>
      <div className="flex items-center gap-3 text-muted-foreground">
        <ImageIcon aria-hidden="true" className="size-3.5 shrink-0" />
        <input
          type="range"
          aria-label="Zoom"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={crop.zoom}
          onChange={(event) => update({ ...crop, zoom: Number(event.target.value) })}
          className="h-1.5 w-full cursor-pointer accent-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
        <ImageIcon aria-hidden="true" className="size-5.5 shrink-0" />
      </div>
    </div>
  );
}
