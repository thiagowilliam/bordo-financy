import { CirclePlus, Luggage, Settings, User } from "lucide-react";

import { Logo } from "@/components/atoms/logo";
import { UserCard } from "@/components/molecules/user-card";
import { SidebarNav, type SidebarNavItem } from "@/components/organisms/sidebar-nav";
import { cn } from "@/lib/utils";

const globalItems: SidebarNavItem[] = [
  { href: "/viagens", label: "Minhas viagens", icon: <Luggage />, exact: true },
  { href: "/viagens/nova", label: "Nova viagem", icon: <CirclePlus /> },
  { href: "/perfil", label: "Perfil", icon: <User /> },
  { href: "/configuracoes/categorias", label: "Configurações", icon: <Settings /> },
];

export type SidebarProps = Omit<React.ComponentProps<"div">, "children"> & {
  user: { name: string; email: string };
  /** Trip menu shown below the global menu while a trip is open. */
  tripMenu?: React.ReactNode;
};

/** Full desktop sidebar column: logo, global menu and user card. */
export function Sidebar({ user, tripMenu, className, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        "flex h-full w-66 flex-col justify-between border-r border-border bg-card px-5 py-7",
        className,
      )}
      {...props}
    >
      <div className="flex min-h-0 flex-col gap-7 overflow-y-auto">
        <Logo className="px-2" />
        <SidebarNav items={globalItems} />
        {tripMenu}
      </div>
      <UserCard className="shrink-0" name={user.name} email={user.email} />
    </div>
  );
}
