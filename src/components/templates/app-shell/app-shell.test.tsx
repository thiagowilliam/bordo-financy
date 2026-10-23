import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the sidebar and the content slots", () => {
    render(<AppShell sidebar={<p>Menu</p>}>Conteúdo</AppShell>);
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo");
  });
});
