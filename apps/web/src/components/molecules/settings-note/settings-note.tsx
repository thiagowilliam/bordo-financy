import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

export type SettingsNoteProps = React.ComponentProps<"p">;

/** Informative note under a settings list: subtle info icon plus muted text. */
export function SettingsNote({ children, className, ...props }: SettingsNoteProps) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 text-[13px] leading-[1.5] text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-subtle-foreground" />
      <span>{children}</span>
    </p>
  );
}
