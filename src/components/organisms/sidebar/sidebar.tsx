import { CirclePlus, Luggage, Settings, User } from "lucide-react";

import { Logo } from "@/components/atoms/logo";
import { UserCard } from "@/components/molecules/user-card";
import { SidebarNav, type SidebarNavItem } from "@/components/organisms/sidebar-nav";
import { cn } from "@/lib/utils";

const globalItems: SidebarNavItem[] = [
  { href: "/viagens", label: "Minhas viagens", icon: <Luggage /> },
  { href: "/viagens/nova", label: "Nova viagem", icon: <CirclePlus /> },
  // No profile route yet: the typed-route cast goes away when it exists.
  { href: "/perfil" as SidebarNavItem["href"], label: "Perfil", icon: <User /> },
  { href: "/configuracoes/categorias", label: "Configurações", icon: <Settings /> },
];

export type SidebarProps = Omit<React.ComponentProps<"div">, "children"> & {
  user: { name: string; email: string };
};

/** Full desktop sidebar column: logo, global menu and user card. */
export function Sidebar({ user, className, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col justify-between border-r border-border bg-card px-5 py-7",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-7">
        <Logo className="px-2" />
        <SidebarNav items={globalItems} />
      </div>
      <UserCard name={user.name} email={user.email} />
    </div>
  );
}
