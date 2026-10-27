import { Avatar } from "@/components/atoms/avatar";
import { GoogleLogo } from "@/components/atoms/google-logo";
import { cn } from "@/lib/utils";

export type GoogleAccountCardProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Account name, used for the avatar initial when there is no photo. */
  name: string;
  email: string;
  photoUrl?: string | null;
  title?: string;
};

/** Google account photo with the Google badge, plus a title and the account e-mail. */
export function GoogleAccountCard({
  name,
  email,
  photoUrl,
  title = "Foto da sua conta Google",
  className,
  ...props
}: GoogleAccountCardProps) {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      <div className="relative size-19 shrink-0">
        <Avatar name={name} src={photoUrl} size="xl" />
        <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border border-border bg-white shadow-[0_2px_6px_rgb(28_43_46/0.15)]">
          <GoogleLogo />
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        <p className="truncate text-[13px] text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}
