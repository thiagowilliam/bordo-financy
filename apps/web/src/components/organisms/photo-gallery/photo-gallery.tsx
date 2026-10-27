import { PhotoAddTile } from "@/components/molecules/photo-add-tile";
import { PhotoCard } from "@/components/molecules/photo-card";
import { cn } from "@/lib/utils";

export type GalleryPhoto = { id: string; url: string; alt: string; isCover: boolean };

export type PhotoGalleryProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Ordered by the caller, with exactly one cover when there are photos. */
  photos: GalleryPhoto[];
  onAddFiles: (files: File[]) => void;
  onSetCover: (id: string) => void;
  onDelete: (id: string) => void;
  /** False when the photo limit was reached. */
  canAdd: boolean;
};

/** Trip photo layout: cover and two stacked photos on top, the rest in a grid. */
export function PhotoGallery({
  photos,
  onAddFiles,
  onSetCover,
  onDelete,
  canAdd,
  className,
  ...props
}: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className={className} {...props}>
        <PhotoAddTile onFiles={onAddFiles} className="h-57.5 w-full" />
      </div>
    );
  }

  const [cover, ...others] = photos;
  return (
    <div className={className} {...props}>
      <ul
        aria-label="Fotos da viagem"
        className={cn(
          "grid grid-cols-2 gap-x-2 gap-y-4.5 md:auto-rows-[230px] md:grid-cols-4 md:grid-rows-[180px_180px] md:gap-5",
        )}
      >
        <li className="col-span-2 md:col-span-4 md:col-start-1 md:row-span-2 md:row-start-1 md:mr-90">
          <PhotoCard
            size="cover"
            src={cover.url}
            alt={cover.alt}
            isCover={cover.isCover}
            onSetCover={() => onSetCover(cover.id)}
            onDelete={() => onDelete(cover.id)}
          />
        </li>
        {others.map((photo, index) => (
          <li
            key={photo.id}
            className={cn(
              index === 0 && "md:col-start-4 md:row-start-1 md:w-85 md:justify-self-end",
              index === 1 && "md:col-start-4 md:row-start-2 md:w-85 md:justify-self-end",
              // The design leaves 28px (not 20) between the cover block and the first grid row.
              index >= 2 && index <= 5 && "md:mt-2",
            )}
          >
            <PhotoCard
              size={index < 2 ? "stack" : "grid"}
              src={photo.url}
              alt={photo.alt}
              isCover={photo.isCover}
              onSetCover={() => onSetCover(photo.id)}
              onDelete={() => onDelete(photo.id)}
              className={index < 2 ? "md:h-full" : undefined}
            />
          </li>
        ))}
        {canAdd ? (
          <li className={cn(others.length >= 2 && others.length <= 5 && "md:mt-2")}>
            <PhotoAddTile onFiles={onAddFiles} className="h-42.75 md:h-57.5" />
          </li>
        ) : null}
      </ul>
    </div>
  );
}
