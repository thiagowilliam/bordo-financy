import {
  Baby,
  Bed,
  BookOpen,
  Bus,
  Camera,
  Car,
  Coffee,
  Coins,
  Dog,
  Dumbbell,
  Ellipsis,
  FileText,
  Fuel,
  Gift,
  Heart,
  HeartPulse,
  Landmark,
  Music,
  Pill,
  Plane,
  Scissors,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Tag,
  Ticket,
  Utensils,
  Wifi,
  Wine,
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
  pill: Pill,
  shirt: Shirt,
  baby: Baby,
  dog: Dog,
  music: Music,
  gift: Gift,
  "book-open": BookOpen,
  dumbbell: Dumbbell,
  scissors: Scissors,
  wine: Wine,
  heart: Heart,
  coffee: Coffee,
  landmark: Landmark,
  "file-text": FileText,
  ellipsis: Ellipsis,
} as const satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof categoryIcons;

const categoryIconVariants = cva("flex shrink-0 items-center justify-center", {
  variants: {
    size: {
      sm: "size-8 rounded-lg [&_svg]:size-4",
      md: "size-11 rounded-lg [&_svg]:size-5",
      lg: "size-14 rounded-2xl [&_svg]:size-7",
    },
    /** `solid` is a filled tile with a white icon; `soft` is a tinted tile with a colored icon. */
    tone: {
      solid: "text-white",
      soft: "",
    },
    color: {
      1: "",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
    },
  },
  compoundVariants: [
    { tone: "solid", color: 1, className: "bg-chart-1" },
    { tone: "solid", color: 2, className: "bg-chart-2" },
    { tone: "solid", color: 3, className: "bg-chart-3" },
    { tone: "solid", color: 4, className: "bg-chart-4" },
    { tone: "solid", color: 5, className: "bg-chart-5" },
    { tone: "solid", color: 6, className: "bg-chart-6" },
    { tone: "solid", color: 7, className: "bg-chart-7" },
    { tone: "solid", color: 8, className: "bg-chart-8" },
    { tone: "soft", color: 1, className: "bg-chart-1/13 text-chart-1" },
    { tone: "soft", color: 2, className: "bg-chart-2/13 text-chart-2" },
    { tone: "soft", color: 3, className: "bg-chart-3/13 text-chart-3" },
    { tone: "soft", color: 4, className: "bg-chart-4/13 text-chart-4" },
    { tone: "soft", color: 5, className: "bg-chart-5/13 text-chart-5" },
    { tone: "soft", color: 6, className: "bg-chart-6/13 text-chart-6" },
    { tone: "soft", color: 7, className: "bg-chart-7/13 text-chart-7" },
    { tone: "soft", color: 8, className: "bg-chart-8/13 text-chart-8" },
  ],
  defaultVariants: { size: "md", tone: "solid", color: 1 },
});

export type CategoryIconProps = Omit<React.ComponentProps<"span">, "children" | "color"> &
  VariantProps<typeof categoryIconVariants> & {
    icon: CategoryIconName;
    /** Accessible name. Omit when the category name is already next to the icon. */
    label?: string;
  };

export function CategoryIcon({
  icon,
  color,
  size,
  tone,
  label,
  className,
  ...props
}: CategoryIconProps) {
  const Icon = categoryIcons[icon];
  return (
    <span
      className={cn(categoryIconVariants({ size, tone, color }), className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <Icon />
    </span>
  );
}
