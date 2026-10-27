import { cva } from "class-variance-authority";
import Link from "next/link";

import { Logo } from "@/components/atoms/logo";
import { cn } from "@/lib/utils";

const iconCircleVariants = cva(
  "flex size-14 items-center justify-center rounded-full [&_svg]:size-6.5",
  {
    variants: {
      tone: {
        primary: "bg-primary-soft text-primary",
        success: "bg-success-soft text-success-ink",
        warning: "bg-warning-soft text-warning-ink",
      },
    },
    defaultVariants: { tone: "primary" },
  },
);

/** Look of the primary button of the auth screens (Pencil "Button Accent"), for `variant="cta"`. */
export const authSubmitClassName =
  "h-13.5 w-full px-5.5 text-base font-bold gap-2 disabled:opacity-40 [&_svg:not([class*='size-'])]:size-4.5";

export type AuthCardProps = Omit<React.ComponentProps<"main">, "title"> & {
  title: string;
  description?: React.ReactNode;
  /** The form. Optional for states that only have a button. */
  children?: React.ReactNode;
  /** First element inside the card, e.g. an error or warning `FormNotice`. */
  banner?: React.ReactNode;
  /** Icon shown in a 56px circle between the logo and the heading. */
  icon?: React.ReactNode;
  iconTone?: "primary" | "success" | "warning";
  /** Centered line under the card content, e.g. a link to another auth screen. */
  footer?: React.ReactNode;
};

/** Page skeleton for the (auth) routes: centered card on the sand background. */
export function AuthCard({
  title,
  description,
  children,
  banner,
  icon,
  iconTone = "primary",
  footer,
  className,
  ...props
}: AuthCardProps) {
  return (
    <main
      className={cn(
        "flex min-h-svh items-center justify-center bg-background px-5 py-10",
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-115 flex-col gap-5.5 rounded-[28px] border border-border bg-card p-7 shadow-[0_8px_28px_#1C2B2E14] md:gap-6 md:p-10">
        {banner}
        <Logo className="mx-auto" />
        {icon ? (
          <div aria-hidden className={cn(iconCircleVariants({ tone: iconTone }), "mx-auto")}>
            {icon}
          </div>
        ) : null}
        <div className="flex flex-col items-center gap-1.5 text-center md:gap-2">
          <h1 className="text-[26px] leading-tight font-bold tracking-[-0.5px] text-foreground md:text-[28px] md:tracking-[-0.6px]">
            {title}
          </h1>
          {description ? (
            <p className="text-[15px] leading-[1.45] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {children}
        {footer ? (
          <div className="flex flex-col items-center gap-5.5 text-center text-sm text-muted-foreground md:gap-6">
            {footer}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export type AuthFooterLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: React.ComponentProps<typeof Link>["href"];
};

/** Primary colored link used inside the `AuthCard` footer. */
export function AuthFooterLink({ className, ...props }: AuthFooterLinkProps) {
  return (
    <Link
      className={cn(
        "rounded-sm text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}
