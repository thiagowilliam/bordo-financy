import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export type TripCoverProps = Omit<React.ComponentProps<"div">, "children"> & {
  name: string;
  destination: string;
  /** Already formatted period, e.g. "12 a 26 out 2026". */
  period: string;
  /** Phase pill text, e.g. "Em andamento · Dia 11 de 15". */
  phaseLabel: string;
  coverPhotoUrl: string | null;
};

/** Hero banner of the trip overview: cover photo, gradient, phase pill, name and meta. */
export function TripCover({
  name,
  destination,
  period,
  phaseLabel,
  coverPhotoUrl,
  className,
  ...props
}: TripCoverProps) {
  return (
    <div
      className={cn(
        "relative flex h-62.5 w-full items-end overflow-hidden rounded-3xl bg-primary-strong md:h-75",
        className,
      )}
      {...props}
    >
      {coverPhotoUrl ? (
        <Image
          src={coverPhotoUrl}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 1100px, 100vw"
          className="object-cover"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-transparent from-20% to-foreground/85 to-100%"
      />
      <div className="relative flex flex-col items-start gap-2 p-5 md:gap-2.5 md:p-8">
        <span className="rounded-full bg-white/92 px-3 py-[5px] text-xs leading-4 font-bold text-foreground md:px-3.5 md:py-1.5 md:text-[13px]">
          {phaseLabel}
        </span>
        <h1 className="text-3xl font-bold tracking-[-0.5px] text-white md:text-[46px] md:leading-[1.2] md:tracking-[-1px]">
          {name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-sm font-medium text-white md:gap-x-4.5 md:text-[15px]">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-[15px] shrink-0 md:size-4" aria-hidden="true" />
            {destination}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-[15px] shrink-0 md:size-4" aria-hidden="true" />
            {period}
          </span>
        </div>
      </div>
    </div>
  );
}
