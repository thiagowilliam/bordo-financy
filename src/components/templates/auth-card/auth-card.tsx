import Link from "next/link";

import { Logo } from "@/components/atoms/logo";
import { cn } from "@/lib/utils";

export type AuthCardProps = Omit<React.ComponentProps<"main">, "title"> & {
  title: string;
  description?: React.ReactNode;
  /** The form. */
  children: React.ReactNode;
  /** Centered line under the card content, e.g. a link to another auth screen. */
  footer?: React.ReactNode;
};

/** Page skeleton for the (auth) routes: centered card on the sand background. */
export function AuthCard({
  title,
  description,
  children,
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
      <div className="flex w-full max-w-115 flex-col gap-6 rounded-3xl bg-card p-6 md:rounded-[28px] md:p-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo hideTagline />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-[28px] leading-tight font-bold text-foreground">{title}</h1>
            {description ? (
              <p className="text-[15px] leading-normal text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {children}
        {footer ? <p className="text-center text-sm text-muted-foreground">{footer}</p> : null}
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
