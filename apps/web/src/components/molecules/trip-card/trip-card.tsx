import { MapPin } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Money } from "@/components/atoms/money";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { getBudgetSummary, type BudgetStatus } from "@/lib/budget";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

const percentToneClass: Record<BudgetStatus, string> = {
  ok: "text-success-ink",
  warning: "text-warning-ink",
  over: "text-destructive-ink",
};

export type TripCardProps<T extends string = string> = Omit<
  React.ComponentProps<typeof Link>,
  "href" | "children"
> & {
  /** Typed route; dynamic segments are checked through the generic. */
  href: Route<T>;
  name: string;
  destination: string;
  /** Already formatted period, e.g. "12 – 26 out". */
  period: string;
  /** Text of the pill over the cover, e.g. "Dia 11 de 15". */
  badgeLabel: string;
  coverPhotoUrl: string | null;
  spentInCents: number;
  budgetInCents: number;
  currency: CurrencyCode;
  /** Hints the browser which image size to download. */
  imageSizes?: string;
};

/** Trip summary card. The whole card is a single link to the trip. */
export function TripCard<T extends string>({
  href,
  name,
  destination,
  period,
  badgeLabel,
  coverPhotoUrl,
  spentInCents,
  budgetInCents,
  currency,
  imageSizes = "(min-width: 768px) 360px, 100vw",
  className,
  ...props
}: TripCardProps<T>) {
  const { status, percentUsed, progress, remainingInCents } = getBudgetSummary(
    spentInCents,
    budgetInCents,
  );
  const isOver = status === "over";

  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow outline-none",
        "hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      <div className="relative flex h-42 items-start bg-secondary p-3">
        {coverPhotoUrl ? (
          <Image src={coverPhotoUrl} alt="" fill sizes={imageSizes} className="object-cover" />
        ) : null}
        <span className="relative rounded-full bg-card/90 px-2.5 py-1.25 text-xs font-bold text-foreground">
          {badgeLabel}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-[19px] font-bold tracking-tight text-foreground">{name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.75 shrink-0" aria-hidden="true" />
          <span>
            {destination} · {period}
          </span>
        </p>
        <div className="flex items-end justify-between gap-2">
          <Money
            amount={spentInCents}
            currency={currency}
            trimZeroCents
            size="lg"
            className="tracking-tight"
          />
          <span className="text-sm text-muted-foreground">
            de{" "}
            <Money
              amount={budgetInCents}
              currency={currency}
              trimZeroCents
              size="sm"
              tone="muted"
            />
          </span>
        </div>
        <ProgressBar
          progress={progress}
          status={status}
          aria-label={`Orçamento de ${name} usado`}
        />
        <div className="flex items-center justify-between gap-2 text-[13px]">
          <span className={cn("font-semibold", percentToneClass[status])}>
            {percentUsed}% usado
          </span>
          <span className="text-muted-foreground">
            <Money
              amount={Math.abs(remainingInCents)}
              currency={currency}
              trimZeroCents
              size="sm"
              tone="muted"
              className="text-[13px]"
            />{" "}
            {isOver ? "acima" : "restantes"}
          </span>
        </div>
      </div>
    </Link>
  );
}
