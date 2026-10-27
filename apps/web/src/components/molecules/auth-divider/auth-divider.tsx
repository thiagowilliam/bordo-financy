import { cn } from "@/lib/utils";

export type AuthDividerProps = React.ComponentProps<"div">;

/** Horizontal rule with a centered label, e.g. "ou" between Google and the form. */
export function AuthDivider({ className, children = "ou", ...props }: AuthDividerProps) {
  return (
    <div className={cn("flex items-center gap-3.5", className)} {...props}>
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span className="text-[13px] font-medium text-muted-foreground">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}
