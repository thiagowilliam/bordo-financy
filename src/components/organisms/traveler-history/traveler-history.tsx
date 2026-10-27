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
      <dt className="text-[12.5px] font-medium text-muted-foreground md:text-[13px]">{label}</dt>
      <dd className="text-[26px] leading-none font-bold text-foreground financial-value md:text-[30px]">
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
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 md:gap-5 md:p-7",
        className,
      )}
      {...props}
    >
      <h2 id="traveler-history-title" className="text-[17px] font-bold text-foreground md:text-lg">
        Seu histórico de viajante
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 md:flex md:gap-0 md:divide-x md:divide-border [&>div]:md:flex-1">
        <Metric label="Viagens">{trips}</Metric>
        <Metric label="Dias viajados" className="border-l border-border pl-4 md:border-l-0">
          {daysTraveled}
        </Metric>
        <Metric label="Destinos" className="border-t border-border pt-4 md:border-t-0 md:pt-0">
          {destinations}
        </Metric>
        <Metric label="Total registrado" className="border-l border-border pl-4 md:border-l-0">
          <Money
            amount={total.amountInCents}
            currency={total.currency}
            className="text-[26px] leading-none font-bold text-primary md:text-[30px]"
          />
        </Metric>
      </dl>
    </section>
  );
}
