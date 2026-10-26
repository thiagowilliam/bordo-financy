"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { findActiveHref } from "@/lib/active-nav";
import { cn } from "@/lib/utils";

export type SettingsNavItem = {
  href: Route;
  label: string;
  /** Rendered element (not a component) so it can cross the server/client boundary. */
  icon: React.ReactNode;
  /** Not available yet: rendered as a non-link with an "Em breve" hint. */
  disabled?: boolean;
};

export type SettingsNavProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: SettingsNavItem[];
};

const itemBase =
  "flex items-center gap-3 whitespace-nowrap border-b-2 px-0.5 py-2.5 text-sm transition-colors outline-none md:rounded-md md:border-b-0 md:px-3.5 md:py-[11px] md:text-[15px]";

/** Settings sections: a vertical list from md up, a horizontal tab row below, from one markup. */
export function SettingsNav({ items, className, ...props }: SettingsNavProps) {
  const pathname = usePathname();
  const activeHref = findActiveHref(
    pathname,
    items.filter((item) => !item.disabled),
  );

  return (
    <nav
      aria-label="Configurações"
      className={cn("md:w-[232px] md:shrink-0", className)}
      {...props}
    >
      <ul className="flex gap-[22px] overflow-x-auto border-b border-border md:flex-col md:gap-1 md:overflow-visible md:border-b-0">
        {items.map(({ href, label, icon, disabled }) => {
          const active = !disabled && href === activeHref;
          const iconEl = (
            <span
              aria-hidden
              className={cn(
                "hidden md:flex [&_svg]:size-5",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {icon}
            </span>
          );
          return (
            <li key={href} className="shrink-0 md:shrink">
              {disabled ? (
                <span
                  aria-disabled="true"
                  title="Em breve"
                  className={cn(
                    itemBase,
                    "cursor-not-allowed border-transparent font-semibold text-subtle-foreground md:font-medium",
                  )}
                >
                  {iconEl}
                  {label}
                  <span className="sr-only"> (Em breve)</span>
                </span>
              ) : (
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    itemBase,
                    "focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-primary bg-transparent font-bold text-primary-strong md:bg-primary-soft"
                      : "border-transparent font-semibold text-muted-foreground hover:text-foreground md:font-medium md:hover:bg-muted",
                  )}
                >
                  {iconEl}
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
