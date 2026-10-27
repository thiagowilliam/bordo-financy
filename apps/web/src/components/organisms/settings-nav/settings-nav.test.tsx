import type { Route } from "next";
import { render, screen } from "@testing-library/react";
import { CreditCard, Tags } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { SettingsNav, type SettingsNavItem } from "./settings-nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/configuracoes/categorias" }));

const items: SettingsNavItem[] = [
  { href: "/configuracoes/categorias", label: "Categorias", icon: <Tags /> },
  {
    href: "/configuracoes/pagamentos" as Route,
    label: "Formas de pagamento",
    icon: <CreditCard />,
    disabled: true,
  },
];

describe("SettingsNav", () => {
  it("renders a single labelled nav and marks the active link", () => {
    render(<SettingsNav items={items} />);
    expect(screen.getAllByRole("navigation", { name: "Configurações" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Categorias" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders disabled items as non-links with an Em breve hint", () => {
    render(<SettingsNav items={items} />);
    expect(screen.queryByRole("link", { name: /Formas de pagamento/ })).not.toBeInTheDocument();
    const disabled = screen.getByText(/Formas de pagamento/, { selector: "span[aria-disabled]" });
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(disabled).toHaveAttribute("title", "Em breve");
    expect(disabled).toHaveTextContent("Em breve");
  });
});
