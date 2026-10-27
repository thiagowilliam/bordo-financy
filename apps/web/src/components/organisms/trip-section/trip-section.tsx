import { Children, useId } from "react";

import { SectionHeading } from "@/components/molecules/section-heading";
import { cn } from "@/lib/utils";

export type TripSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: string;
  /** Number shown in the heading pill. */
  count: number;
  /** Cards, rendered in a responsive grid. */
  children: React.ReactNode;
};

/** Titled group of trip cards laid out in a responsive grid. */
export function TripSection({ title, count, children, className, ...props }: TripSectionProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <SectionHeading title={title} count={count} headingId={headingId} />
      <ul className="grid grid-cols-1 gap-6.5 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
        {Children.map(children, (child) => (
          <li className="flex">{child}</li>
        ))}
      </ul>
    </section>
  );
}
