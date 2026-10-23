import {
  Bed,
  Bus,
  Camera,
  Car,
  Coins,
  Fuel,
  HeartPulse,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Ticket,
  Utensils,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const categoryIcons = {
  utensils: Utensils,
  camera: Camera,
  bus: Bus,
  "shopping-bag": ShoppingBag,
  fuel: Fuel,
  coins: Coins,
  "heart-pulse": HeartPulse,
  plane: Plane,
  bed: Bed,
  car: Car,
  "shield-check": ShieldCheck,
  wifi: Wifi,
  ticket: Ticket,
  tag: Tag,
} as const satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof categoryIcons;

const categoryIconVariants = cva("flex shrink-0 items-center justify-center text-white", {
  variants: {
    size: {
      sm: "size-8 rounded-lg [&_svg]:size-4",
      md: "size-[42px] rounded-xl [&_svg]:size-5",
      lg: "size-14 rounded-2xl [&_svg]:size-7",
    },
    color: {
      1: "bg-chart-1",
      2: "bg-chart-2",
      3: "bg-chart-3",
      4: "bg-chart-4",
      5: "bg-chart-5",
      6: "bg-chart-6",
      7: "bg-chart-7",
      8: "bg-chart-8",
    },
  },
  defaultVariants: { size: "md", color: 1 },
});

export type CategoryIconProps = Omit<React.ComponentProps<"span">, "children" | "color"> &
  VariantProps<typeof categoryIconVariants> & {
    icon: CategoryIconName;
    /** Accessible name. Omit when the category name is already next to the icon. */
    label?: string;
  };

export function CategoryIcon({ icon, color, size, label, className, ...props }: CategoryIconProps) {
  const Icon = categoryIcons[icon];
  return (
    <span
      className={cn(categoryIconVariants({ size, color }), className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <Icon />
    </span>
  );
}
