import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { GoogleLogo } from "@/components/atoms/google-logo";
import { cn } from "@/lib/utils";

const googleButtonVariants = cva(
  "inline-flex items-center justify-center gap-3 border border-[#747775] bg-card font-medium whitespace-nowrap text-foreground transition-colors outline-none select-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none aria-busy:border-foreground/10 aria-busy:bg-[#F7F7F7] aria-busy:text-foreground/60",
  {
    variants: {
      size: {
        default: "h-13.5 w-full rounded-[14px] px-5.5 text-base",
        sm: "h-10.5 w-auto rounded-[14px] px-4.5 text-sm",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type GoogleButtonProps = Omit<React.ComponentProps<"button">, "children"> &
  VariantProps<typeof googleButtonVariants> & {
    label?: string;
    isLoading?: boolean;
    loadingLabel?: string;
  };

/** "Continuar com Google" outline button with the Google logo. */
export function GoogleButton({
  label = "Continuar com Google",
  loadingLabel = "Conectando...",
  isLoading = false,
  size,
  type = "button",
  disabled,
  className,
  ...props
}: GoogleButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        googleButtonVariants({ size }),
        disabled && !isLoading && "opacity-50",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 aria-hidden className="size-5 shrink-0 animate-spin text-primary" />
      ) : (
        <GoogleLogo />
      )}
      {isLoading ? loadingLabel : label}
    </button>
  );
}
