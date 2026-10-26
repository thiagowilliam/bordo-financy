import { CreditCard, SlidersHorizontal, Tags } from "lucide-react";
import type { Route } from "next";

import { PageHeader } from "@/components/molecules/page-header";
import { SettingsNav } from "@/components/organisms/settings-nav";

// Only "Categorias" exists so far: the other sections are shown as coming soon.
const settingsItems = [
  { href: "/configuracoes/categorias" as Route, label: "Categorias", icon: <Tags /> },
  {
    href: "/configuracoes/pagamentos" as Route,
    label: "Formas de pagamento",
    icon: <CreditCard />,
    disabled: true,
  },
  {
    href: "/configuracoes/preferencias" as Route,
    label: "Preferências",
    icon: <SlidersHorizontal />,
    disabled: true,
  },
];

export default function SettingsLayout({ children }: LayoutProps<"/configuracoes">) {
  return (
    <div className="flex flex-col gap-5 md:gap-7">
      <PageHeader
        title="Configurações"
        subtitleClassName="text-sm md:text-base"
        subtitle={
          <>
            <span className="md:hidden">Categorias, pagamentos e preferências.</span>
            <span className="hidden md:inline">
              Personalize categorias, formas de pagamento e preferências do Bordo.
            </span>
          </>
        }
      />
      <div className="flex flex-col gap-5 md:flex-row md:gap-10">
        <SettingsNav items={settingsItems} className="md:w-58 md:shrink-0" />
        {children}
      </div>
    </div>
  );
}
