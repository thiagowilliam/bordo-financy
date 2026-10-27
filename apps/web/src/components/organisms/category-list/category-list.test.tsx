import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryList } from "./category-list";
import { lisbonCategories } from "./category-list.fixtures";

describe("CategoryList", () => {
  it("renders one list item per category", () => {
    render(<CategoryList items={lisbonCategories} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(7);
    expect(within(items[0]!).getByText("Alimentação")).toBeInTheDocument();
    expect(within(items[6]!).getByText("Oculta")).toBeInTheDocument();
  });

  it("shows the empty state", () => {
    render(<CategoryList items={[]} />);
    expect(screen.getByText("Nenhuma categoria")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
