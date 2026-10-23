"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";

import { NavItem } from "@/components/molecules/nav-item";
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

function matches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The most specific matching item wins, so /viagens/nova does not activate /viagens. */
function findActiveHref(pathname: string, items: SidebarNavItem[]) {
  let active: string | undefined;
  for (const { href } of items) {
    if (matches(pathname, href) && (active === undefined || href.length > active.length)) {
      active = href;
    }
  }
  return active;
}

export function SidebarNav({ items, className, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const activeHref = findActiveHref(pathname, items);
  return (
    <nav
      aria-label="Navegação principal"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      {items.map(({ href, label, icon }) => (
        <NavItem key={href} href={href} label={label} icon={icon} active={href === activeHref} />
      ))}
    </nav>
  );
}
