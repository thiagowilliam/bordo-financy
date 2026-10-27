import { Anchor } from "lucide-react";

import { cn } from "@/lib/utils";

export type LogoProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Hide the "Diário financeiro de viagem" tagline. */
  hideTagline?: boolean;
};

export function Logo({ hideTagline = false, className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Anchor className="size-[22px]" aria-hidden="true" />
      </span>
      <span className="flex flex-col gap-px">
        <span className="text-[22px] leading-tight font-bold tracking-tight text-foreground">
          Bordo
        </span>
        {hideTagline ? null : (
          <span className="text-[11px] leading-tight text-muted-foreground">
            Diário financeiro de viagem
          </span>
        )}
      </span>
    </div>
  );
}
