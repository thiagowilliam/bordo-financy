import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  /** Omit on the last item: it is the current page. */
  href?: React.ComponentProps<typeof Link>["href"];
};

export type BreadcrumbProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: BreadcrumbItem[];
};

/** Trail of links ending on the current page. */
export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha de navegação" className={className} {...props}>
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <Fragment key={item.label}>
              <li>
                {item.href && !isCurrent ? (
                  <Link
                    href={item.href}
                    className="rounded-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page" className={cn("font-bold text-foreground")}>
                    {item.label}
                  </span>
                )}
              </li>
              {isCurrent ? null : (
                <li aria-hidden="true" className="flex text-subtle-foreground">
                  <ChevronRight className="size-3.5" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
