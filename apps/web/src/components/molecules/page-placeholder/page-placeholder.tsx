import { cn } from "@/lib/utils";

export type PagePlaceholderProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: string;
  description?: string;
};

/** Temporary page body used by routes that are not designed yet. */
export function PagePlaceholder({
  title,
  description,
  children,
  className,
  ...props
}: PagePlaceholderProps) {
  return (
    <section className={cn("flex flex-col gap-2 p-6", className)} {...props}>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {children}
    </section>
  );
}
