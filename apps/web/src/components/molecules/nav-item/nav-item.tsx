import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type NavItemProps = Omit<React.ComponentProps<typeof Link>, "href" | "children"> & {
  href: Route;
  label: string;
  /** Rendered element (not a component) so it can cross the server/client boundary. */
  icon: React.ReactNode;
  active?: boolean;
};

/** Navigation link with icon and active state. */
export function NavItem({ href, label, icon, active = false, className, ...props }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3.5 py-[11px] text-[15px] transition-colors",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "bg-primary-soft font-bold text-primary-strong"
          : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn("flex [&_svg]:size-5", active ? "text-primary" : "text-muted-foreground")}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
