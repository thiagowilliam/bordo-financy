import { cn } from "@/lib/utils";

export type AppShellProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Sidebar content, shown from the md breakpoint up. */
  sidebar: React.ReactNode;
  /** Top bar content, shown below the md breakpoint. */
  mobileHeader?: React.ReactNode;
  /** Floating bottom navigation, shown below the md breakpoint. */
  mobileNav?: React.ReactNode;
  children: React.ReactNode;
};

/** Page skeleton of the logged area: sidebar and mobile header slots plus content slot. */
export function AppShell({
  sidebar,
  mobileHeader,
  mobileNav,
  children,
  className,
  ...props
}: AppShellProps) {
  return (
    <div
      className={cn("group/shell flex min-h-svh flex-1 flex-col md:flex-row", className)}
      {...props}
    >
      <aside className="sticky top-0 hidden h-svh shrink-0 md:block">{sidebar}</aside>
      {mobileHeader ? <div className="px-5 pt-2 md:hidden">{mobileHeader}</div> : null}
      <main
        className={cn(
          "flex min-w-0 flex-1 flex-col px-5 pt-6 pb-6 md:px-13 md:pt-10 md:pb-14",
          // The nav may render nothing (e.g. no trip open): only make room when it has content.
          "group-has-[[data-mobile-nav]:not(:empty)]/shell:pb-28",
        )}
      >
        {children}
      </main>
      {mobileNav ? (
        <div
          data-mobile-nav
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
        >
          {mobileNav}
        </div>
      ) : null}
    </div>
  );
}
