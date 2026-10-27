import { TripMini } from "@/components/molecules/trip-mini";
import { SidebarNav, type SidebarNavItem } from "@/components/organisms/sidebar-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function SectionLabel() {
  return (
    <p className="text-[11px] font-bold tracking-[1.2px] text-subtle-foreground uppercase">
      Viagem aberta
    </p>
  );
}

export type TripMenuProps = Omit<React.ComponentProps<"section">, "children"> & {
  tripName: string;
  /** Already formatted period, e.g. "12 – 26 out". */
  period: string;
  coverPhotoUrl: string | null;
  items: SidebarNavItem[];
};

/** Sidebar section for the open trip: identity card plus the trip navigation. */
export function TripMenu({
  tripName,
  period,
  coverPhotoUrl,
  items,
  className,
  ...props
}: TripMenuProps) {
  return (
    <section className={cn("flex flex-col gap-1.5", className)} {...props}>
      <SectionLabel />
      <TripMini name={tripName} period={period} coverPhotoUrl={coverPhotoUrl} />
      <SidebarNav aria-label="Navegação da viagem" items={items} className="pt-1.5" />
    </section>
  );
}

export type TripMenuSkeletonProps = Omit<React.ComponentProps<"section">, "children">;

/** Loading placeholder with the same footprint as `TripMenu`. */
export function TripMenuSkeleton({ className, ...props }: TripMenuSkeletonProps) {
  return (
    <section
      aria-busy="true"
      aria-label="Carregando viagem"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      <SectionLabel />
      <Skeleton className="h-16 rounded-lg" />
      <div className="flex flex-col gap-1 pt-1.5">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-11 rounded-md" />
        ))}
      </div>
    </section>
  );
}
