import { CalendarDays, Camera } from "lucide-react";

import { Avatar } from "@/components/atoms/avatar";
import { cn } from "@/lib/utils";

export type ProfileHeaderCardProps = Omit<React.ComponentProps<"section">, "children"> & {
  name: string;
  email: string;
  photoUrl?: string | null;
  /** Already formatted text, e.g. "março de 2026". */
  memberSince: string;
  onChangePhoto: () => void;
};

/** Profile summary card: avatar with change-photo button, name, email and member since. */
export function ProfileHeaderCard({
  name,
  email,
  photoUrl,
  memberSince,
  onChangePhoto,
  className,
  ...props
}: ProfileHeaderCardProps) {
  return (
    <section
      aria-label="Perfil"
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-5 text-center md:flex-row md:gap-6 md:p-7 md:text-left",
        className,
      )}
      {...props}
    >
      <div className="relative shrink-0">
        <Avatar name={name} src={photoUrl} size="profile" />
        <button
          type="button"
          onClick={onChangePhoto}
          aria-label="Trocar foto"
          className="absolute right-0 bottom-0 flex size-9.5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground outline-none hover:bg-primary-strong focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Camera aria-hidden className="size-4.5" />
        </button>
      </div>
      <div className="flex min-w-0 flex-col items-center gap-1 md:items-start">
        <h2 className="max-w-full truncate text-[22px] font-bold text-foreground md:text-[26px]">
          {name}
        </h2>
        <p className="max-w-full truncate text-[15px] text-muted-foreground">{email}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <CalendarDays aria-hidden className="size-3.5.5 size-4" />
          No Bordo desde {memberSince}
        </p>
      </div>
    </section>
  );
}
