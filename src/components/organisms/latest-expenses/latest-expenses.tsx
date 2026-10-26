import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { ExpenseRow, type ExpenseRowProps } from "@/components/molecules/expense-row";
import { cn } from "@/lib/utils";

export type LatestExpenseItem = Omit<ExpenseRowProps, "className"> & {
  id: string;
  href: Route;
};

export type LatestExpensesProps = Omit<React.ComponentProps<"section">, "children"> & {
  expenses: LatestExpenseItem[];
  /** Destination of the "Ver todos" link. */
  viewAllHref: Route;
};

/** Most recent expenses and a link to the full list. Head sits outside the card on mobile. */
export function LatestExpenses({
  expenses,
  viewAllHref,
  className,
  ...props
}: LatestExpensesProps) {
  return (
    <section
      aria-labelledby="latest-expenses-title"
      className={cn(
        "flex flex-col gap-2 md:gap-1 md:rounded-2xl md:border md:border-border md:bg-card md:px-7 md:pt-6 md:pb-3",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 md:pb-2">
        <h2 id="latest-expenses-title" className="text-[17px] font-bold text-foreground md:text-lg">
          Últimos lançamentos
        </h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Ver todos
          <ArrowRight className="hidden size-4 md:block" aria-hidden="true" />
        </Link>
      </div>
      {expenses.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground md:border-0 md:bg-transparent md:px-0">
          Nenhum lançamento ainda
        </p>
      ) : (
        <ul className="rounded-xl border border-border bg-card px-4 py-2 md:rounded-none md:border-0 md:bg-transparent md:p-0">
          {expenses.map(({ id, href, ...row }) => (
            <li key={id}>
              <Link
                href={href}
                className="-mx-2 block rounded-lg px-2 py-3 outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ExpenseRow {...row} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
