import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  it("is a labelled search field", () => {
    render(<SearchInput value="abc" onValueChange={() => {}} aria-label="Buscar lançamentos" />);
    const input = screen.getByRole("searchbox", { name: "Buscar lançamentos" });
    expect(input).toHaveValue("abc");
  });

  it("reports typed text", async () => {
    const onValueChange = vi.fn();
    render(<SearchInput value="" onValueChange={onValueChange} aria-label="Buscar" />);
    await userEvent.type(screen.getByRole("searchbox"), "p");
    expect(onValueChange).toHaveBeenCalledWith("p");
  });
});
