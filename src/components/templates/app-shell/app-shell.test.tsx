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
});
