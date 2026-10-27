import { Avatar } from "@/components/atoms/avatar";
import { Logo } from "@/components/atoms/logo";
import { cn } from "@/lib/utils";

export type MobileTopBarProps = Omit<React.ComponentProps<"header">, "children"> & {
  userName: string;
  /** Profile photo. The initial is shown without it. */
  userPhotoUrl?: string | null;
};

/** Top bar shown below the md breakpoint, where the sidebar is hidden. */
export function MobileTopBar({ userName, userPhotoUrl, className, ...props }: MobileTopBarProps) {
  return (
    <header className={cn("flex items-center justify-between", className)} {...props}>
      <Logo />
      <Avatar name={userName} src={userPhotoUrl} size="lg" />
    </header>
  );
}
