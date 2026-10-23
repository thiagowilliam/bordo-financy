import { cn } from "@/lib/utils";

export type AppShellProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Sidebar content, shown from the md breakpoint up. */
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

/** Page skeleton of the logged area: sidebar slot plus content slot. */
export function AppShell({ sidebar, children, className, ...props }: AppShellProps) {
  return (
    <div className={cn("flex min-h-svh flex-1", className)} {...props}>
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 md:flex">
        {sidebar}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
