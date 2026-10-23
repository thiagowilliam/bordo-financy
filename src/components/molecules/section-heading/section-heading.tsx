import { cn } from "@/lib/utils";

export type SectionHeadingProps = Omit<React.ComponentProps<"div">, "children"> & {
  title: string;
  count: number;
  /** Id for the heading, so the section can reference it with aria-labelledby. */
  headingId?: string;
};

/** Section title followed by a count pill. */
export function SectionHeading({
  title,
  count,
  headingId,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props}>
      <h2 id={headingId} className="text-xl font-bold text-foreground max-md:text-[19px]">
        {title}
      </h2>
      <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-[13px] font-bold text-muted-foreground financial-value md:size-6.5">
        {count}
      </span>
    </div>
  );
}
