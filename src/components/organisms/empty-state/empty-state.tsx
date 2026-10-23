import { cn } from "@/lib/utils";

export type EmptyStateProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: string;
  /** Supporting text. Pass a node to vary it per breakpoint. */
  description: React.ReactNode;
  /** Decorative illustration, usually an `Image` with empty alt. */
  illustration?: React.ReactNode;
  /** Primary action, usually a `Button`. */
  action?: React.ReactNode;
};

/** Centered card shown when a list has no content yet. */
export function EmptyState({
  title,
  description,
  illustration,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card px-6 py-10 text-center",
        "md:min-h-140 md:gap-5 md:px-10 md:py-16",
        className,
      )}
      {...props}
    >
      {illustration}
      <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-[32px]">{title}</h2>
      <p className="max-w-130 text-[15px] leading-[1.45] text-muted-foreground md:text-base">
        {description}
      </p>
      {action ? <div className="w-full md:w-auto md:pt-2">{action}</div> : null}
    </section>
  );
}
