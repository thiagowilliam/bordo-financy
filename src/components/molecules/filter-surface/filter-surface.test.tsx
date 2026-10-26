import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilterButton } from "@/components/molecules/filter-button";

import { FilterSurface } from "./filter-surface";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <FilterSurface
      open={open}
      onOpenChange={setOpen}
      title="Categoria"
      mobileAction={<button type="button">Limpar</button>}
      trigger={<FilterButton icon={<svg />} label="Categoria" open={open} />}
    >
      <p>Conteúdo</p>
    </FilterSurface>
  );
}

function mockViewport(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("FilterSurface", () => {
  it("opens a popover on desktop", async () => {
    mockViewport(true);
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Categoria" }));
    expect(screen.getByRole("dialog", { name: "Categoria" })).toHaveTextContent("Conteúdo");
    expect(screen.queryByRole("button", { name: "Limpar" })).not.toBeInTheDocument();
  });

  it("opens a bottom sheet with header action below md", async () => {
    mockViewport(false);
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Categoria" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Conteúdo");
    expect(screen.getByRole("heading", { name: "Categoria" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar" })).toBeInTheDocument();
  });
});
