import { MapPin, Tags } from "lucide-react";

import { Logo } from "@/components/atoms/logo";
import { SidebarNav } from "@/components/organisms/sidebar-nav";
import { AppShell } from "@/components/templates/app-shell";

const navItems = [
  { href: "/viagens", label: "Minhas viagens", icon: <MapPin /> },
  { href: "/configuracoes/categorias", label: "Categorias", icon: <Tags /> },
] as const;

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      sidebar={
        <>
          <Logo />
          <SidebarNav items={[...navItems]} />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
