import { MapPin } from "lucide-react";
import Image from "next/image";

import { Logo } from "@/components/atoms/logo";
import { cn } from "@/lib/utils";

export type WelcomeLayoutProps = Omit<React.ComponentProps<"main">, "children"> & {
  /** Decorative photo shown beside the form (desktop) or as a banner (mobile). */
  imageSrc: string;
  /** Short phrase overlaid on the photo (desktop only). */
  quote: string;
  /** Place name shown with a map pin under the quote (desktop only). */
  place: string;
  /** Small line at the bottom of the form panel (desktop only). */
  footer?: React.ReactNode;
  /** Shorter banner on mobile (150px instead of 240px), when the form has extra content above the field. */
  compactBanner?: boolean;
  /** The form block. A child with `mt-auto` sticks to the bottom on mobile. */
  children: React.ReactNode;
};

/** Page skeleton for the onboarding: photo panel with a quote on desktop, banner on mobile. */
export function WelcomeLayout({
  imageSrc,
  quote,
  place,
  footer,
  compactBanner = false,
  children,
  className,
  ...props
}: WelcomeLayoutProps) {
  return (
    <main className={cn("flex min-h-svh bg-background", className)} {...props}>
      <div className="relative hidden w-165 shrink-0 overflow-hidden md:block">
        <Image src={imageSrc} alt="" fill priority sizes="660px" className="object-cover" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-b from-transparent from-20% to-foreground/85"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3.5 p-14">
          <p className="max-w-137 text-4xl leading-[1.15] font-bold tracking-[-0.8px] text-white">
            {quote}
          </p>
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            <MapPin className="size-4" aria-hidden="true" />
            {place}
          </p>
        </div>
      </div>
      <div className="flex min-h-svh flex-1 flex-col gap-6 px-5 pt-2 pb-7 md:px-16 md:py-10">
        <Logo />
        <div
          className={cn(
            "relative w-full max-w-87.5 shrink-0 self-center overflow-hidden rounded-[28px] md:hidden",
            compactBanner ? "h-37.5" : "h-60",
          )}
        >
          <Image src={imageSrc} alt="" fill priority sizes="350px" className="object-cover" />
        </div>
        <div className="flex flex-1 flex-col md:mx-auto md:w-full md:max-w-120 md:justify-center">
          {children}
        </div>
        {footer ? (
          <p className="hidden text-[13px] text-subtle-foreground md:block">{footer}</p>
        ) : null}
      </div>
    </main>
  );
}
