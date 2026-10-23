import { cn } from "@/lib/utils";

export type AppShellProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Sidebar content, shown from the md breakpoint up. */
  sidebar: React.ReactNode;
  /** Top bar content, shown below the md breakpoint. */
  mobileHeader?: React.ReactNode;
  children: React.ReactNode;
};

/** Page skeleton of the logged area: sidebar and mobile header slots plus content slot. */
export function AppShell({ sidebar, mobileHeader, children, className, ...props }: AppShellProps) {
  return (
    <div className={cn("flex min-h-svh flex-1 flex-col md:flex-row", className)} {...props}>
      <aside className="sticky top-0 hidden h-svh shrink-0 md:block">{sidebar}</aside>
      {mobileHeader ? <div className="px-5 pt-2 md:hidden">{mobileHeader}</div> : null}
      <main className="flex min-w-0 flex-1 flex-col px-5 pt-6 pb-6 md:px-13 md:pt-10 md:pb-14">
        {children}
      </main>
    </div>
  );
}
