import { Avatar } from "@/components/atoms/avatar";
import { cn } from "@/lib/utils";

export type UserCardProps = Omit<React.ComponentProps<"div">, "children"> & {
  name: string;
  email: string;
  /** Profile photo. The initial is shown without it. */
  photoUrl?: string | null;
};

/** Avatar with the user's name and email. */
export function UserCard({ name, email, photoUrl, className, ...props }: UserCardProps) {
  return (
    <div className={cn("flex items-center gap-3 px-2", className)} {...props}>
      <Avatar name={name} src={photoUrl} />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-foreground">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </div>
    </div>
  );
}
