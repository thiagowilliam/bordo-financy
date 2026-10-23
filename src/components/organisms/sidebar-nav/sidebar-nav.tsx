"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  href: Route;
  label: string;
  /** Rendered element (not a component) so it can cross the server/client boundary. */
  icon: React.ReactNode;
};

export type SidebarNavProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: SidebarNavItem[];
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ items, className, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação principal"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      {items.map(({ href, label, icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className="[&_svg]:size-[18px]" aria-hidden="true">
              {icon}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
