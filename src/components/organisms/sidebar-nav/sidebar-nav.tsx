"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";

import { NavItem } from "@/components/molecules/nav-item";
import { findActiveHref } from "@/lib/active-nav";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  href: Route;
  label: string;
  /** Rendered element (not a component) so it can cross the server/client boundary. */
  icon: React.ReactNode;
  /** Active only when the pathname equals the href (no prefix match). */
  exact?: boolean;
};

export type SidebarNavProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: SidebarNavItem[];
};

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
