import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the sidebar and the content slots", () => {
    render(<AppShell sidebar={<p>Menu</p>}>Conteúdo</AppShell>);
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo");
  });

  it("renders the mobile header slot when given", () => {
    render(
      <AppShell sidebar={<p>Menu</p>} mobileHeader={<p>Topo</p>}>
        Conteúdo
      </AppShell>,
    );
    expect(screen.getByText("Topo")).toBeInTheDocument();
  });

  it("omits the mobile header wrapper when not given", () => {
    const { container } = render(<AppShell sidebar={<p>Menu</p>}>Conteúdo</AppShell>);
    expect(container.querySelector(".md\\:hidden")).toBeNull();
  });

  it("renders the mobile nav slot and reserves room for it", () => {
    render(
      <AppShell sidebar={<p>Menu</p>} mobileNav={<p>Abas</p>}>
        Conteúdo
      </AppShell>,
    );
    expect(screen.getByText("Abas")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass(
      "group-has-[[data-mobile-nav]:not(:empty)]/shell:pb-28",
    );
  });

  it("does not render the nav wrapper when there is no mobile nav", () => {
    render(<AppShell sidebar={<p>Menu</p>}>Conteúdo</AppShell>);
    expect(document.querySelector("[data-mobile-nav]")).toBeNull();
  });
});
