import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-strong select-none",
  {
    variants: {
      size: {
        md: "size-9.5 text-[15px]",
        lg: "size-10 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type AvatarProps = Omit<React.ComponentProps<"span">, "children"> &
  VariantProps<typeof avatarVariants> & {
    /** Name used to derive the initial. */
    name: string;
  };

/** Decorative circle with the user's initial. The name is shown next to it elsewhere. */
export function Avatar({ name, size, className, ...props }: AvatarProps) {
  const initial = name.trim().charAt(0).toLocaleUpperCase("pt-BR");
  return (
    <span aria-hidden="true" className={cn(avatarVariants({ size }), className)} {...props}>
      {initial}
    </span>
  );
}

export { avatarVariants };
