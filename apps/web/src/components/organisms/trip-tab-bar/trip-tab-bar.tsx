"use client";

import { Fragment } from "react";
import { Plus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { findActiveHref } from "@/lib/active-nav";
import { cn } from "@/lib/utils";

export type TripTabBarItem = {
  href: Route;
  label: string;
  /** Rendered element (not a component) so it can cross the server/client boundary. */
  icon: React.ReactNode;
};

export type TripTabBarProps = Omit<React.ComponentProps<"nav">, "children"> & {
  /** The four trip destinations, in order. The launch button sits after the second. */
  items: TripTabBarItem[];
  onLaunch: () => void;
};

function TabItem({ href, label, icon, active }: TripTabBarItem & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-14 w-[72px] flex-col items-center justify-center gap-[3px] rounded-full transition-colors",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active ? "bg-primary-soft text-primary-strong" : "text-subtle-foreground",
      )}
    >
      <span aria-hidden="true" className={cn("flex [&_svg]:size-[22px]", active && "text-primary")}>
        {icon}
      </span>
      <span className="text-center text-[10px] leading-[1.1] font-semibold">{label}</span>
    </Link>
  );
}

/** Floating bottom tab bar for the open trip, mobile only. */
export function TripTabBar({ items, onLaunch, className, ...props }: TripTabBarProps) {
  const pathname = usePathname();
  const activeHref = findActiveHref(pathname, items);
  return (
    <nav
      aria-label="Navegação da viagem"
      className={cn(
        "flex h-16 w-full items-center justify-between rounded-[32px] border border-border bg-card/95 p-1 shadow-float md:hidden",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <Fragment key={item.href}>
          <TabItem {...item} active={item.href === activeHref} />
          {index === 1 ? (
            <button
              type="button"
              aria-label="Lançar gasto"
              onClick={onLaunch}
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground shadow-cta outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Plus aria-hidden="true" className="size-7" />
            </button>
          ) : null}
        </Fragment>
      ))}
    </nav>
  );
}
