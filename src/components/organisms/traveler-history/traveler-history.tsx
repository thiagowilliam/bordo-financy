import { Money } from "@/components/atoms/money";
import { cn } from "@/lib/utils";

export type TravelerHistoryProps = Omit<React.ComponentProps<"section">, "children"> & {
  trips: number;
  daysTraveled: number;
  destinations: number;
  total: { amountInCents: number; currency: string };
};

function Metric({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 md:px-6 md:first:pl-0 md:last:pr-0", className)}>
      <dt className="text-[13px] font-medium text-muted-foreground">{label}</dt>
      <dd className="text-[28px] leading-none font-bold text-foreground financial-value md:text-[30px]">
        {children}
      </dd>
    </div>
  );
}

/** Traveler metrics card: trips, days traveled, destinations and total registered. */
export function TravelerHistory({
  trips,
  daysTraveled,
  destinations,
  total,
  className,
  ...props
}: TravelerHistoryProps) {
  return (
    <section
      aria-labelledby="traveler-history-title"
      className={cn(
        "flex flex-col gap-5 rounded-xl border border-border bg-card p-5 md:p-7",
        className,
      )}
      {...props}
    >
      <h2 id="traveler-history-title" className="text-lg font-bold text-foreground">
        Seu histórico de viajante
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 md:flex md:gap-0 md:divide-x md:divide-border [&>div]:md:flex-1">
        <Metric label="Viagens">{trips}</Metric>
        <Metric label="Dias viajados">{daysTraveled}</Metric>
        <Metric label="Destinos">{destinations}</Metric>
        <Metric label="Total registrado">
          <Money
            amount={total.amountInCents}
            currency={total.currency}
            hideCents
            className="text-[28px] leading-none font-bold text-primary md:text-[30px]"
          />
        </Metric>
      </dl>
    </section>
  );
}
