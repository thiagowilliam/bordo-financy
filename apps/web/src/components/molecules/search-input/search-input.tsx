import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type" | "aria-label"
> & {
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name; required since the field has no visible label. */
  "aria-label": string;
};

export function SearchInput({
  value,
  onValueChange,
  placeholder = "Buscar",
  className,
  ...props
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-[11px] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 max-md:py-3",
        className,
      )}
    >
      <Search aria-hidden className="size-4 shrink-0 text-subtle-foreground" />
      <input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm leading-[17px] text-foreground outline-none placeholder:text-subtle-foreground"
        {...props}
      />
    </div>
  );
}
