import { cn } from "@/lib/utils";

export type PageHeaderProps = Omit<React.ComponentProps<"header">, "title" | "children"> & {
  title: string;
  /** Text under the title.  */
  subtitle?: React.ReactNode;
  /** Small line above the title.  */
  eyebrow?: React.ReactNode;
  /** Extra classes for the eyebrow line, e.g. to show it on some breakpoints only. */
  eyebrowClassName?: string;
  /** Extra classes for the subtitle line. */
  subtitleClassName?: string;
};

/** Page title block with optional eyebrow and subtitle. */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  eyebrowClassName,
  subtitleClassName,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-1 md:gap-1.5", className)} {...props}>
      {eyebrow ? (
        <p className={cn("text-sm font-medium text-muted-foreground", eyebrowClassName)}>
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
      {subtitle ? (
        <p className={cn("text-base text-muted-foreground", subtitleClassName)}>{subtitle}</p>
      ) : null}
    </header>
  );
}
