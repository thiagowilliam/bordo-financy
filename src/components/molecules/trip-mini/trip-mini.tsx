import Image from "next/image";

import { cn } from "@/lib/utils";

export type TripMiniProps = Omit<React.ComponentProps<"div">, "children"> & {
  name: string;
  /** Already formatted period, e.g. "12 – 26 out". */
  period: string;
  coverPhotoUrl: string | null;
};

/** Compact trip identity card (thumbnail, name and period) for the sidebar. */
export function TripMini({ name, period, coverPhotoUrl, className, ...props }: TripMiniProps) {
  return (
    <div
      className={cn("flex items-center gap-3 rounded-lg bg-background p-2.5", className)}
      {...props}
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-[10px] bg-secondary">
        {coverPhotoUrl ? (
          <Image src={coverPhotoUrl} alt="" fill sizes="44px" className="object-cover" />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[15px] font-bold text-foreground">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{period}</span>
      </div>
    </div>
  );
}
