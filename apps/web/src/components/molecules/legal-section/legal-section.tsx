import { cn } from "@/lib/utils";

export type LegalSectionProps = Omit<React.ComponentProps<"section">, "title" | "id"> & {
  /** Used to link to the section (`#id`) and to name the heading. */
  id: string;
  title: string;
  children: React.ReactNode;
};

/** A titled block of a legal document. Styles its `p`, `ul`, `ol`, `li` and `a` descendants. */
export function LegalSection({ id, title, children, className, ...props }: LegalSectionProps) {
  const headingId = `${id}-titulo`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("flex scroll-mt-6 flex-col gap-3", className)}
      {...props}
    >
      <h2
        id={headingId}
        className="text-xl leading-snug font-bold tracking-tight text-foreground md:text-[22px]"
      >
        {title}
      </h2>
      <div
        className={cn(
          "flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground md:text-base",
          "[&_p]:text-pretty",
          "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5",
          "[&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-1.5 [&_ol]:pl-5",
          "[&_li]:pl-1 [&_li]:marker:text-subtle-foreground",
          "[&_strong]:font-semibold [&_strong]:text-foreground",
          "[&_a]:rounded-sm [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:outline-none [&_a]:hover:text-primary-strong [&_a]:focus-visible:ring-3 [&_a]:focus-visible:ring-ring/50",
        )}
      >
        {children}
      </div>
    </section>
  );
}
