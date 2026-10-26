import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DayGroup, type DayGroupProps } from "./day-group";

const base: DayGroupProps = {
  label: "Dia 11 · 22 out",
  totalInCents: 2770,
  currency: "EUR",
  entries: [
    {
      id: "1",
      description: "Almoço no Time Out Market",
      categoryName: "Alimentação",
      categoryIcon: "utensils",
      categoryColor: 2,
      paymentMethod: "CREDIT",
      amountInCents: 2450,
      currency: "EUR",
    },
    {
      id: "2",
      description: "Metrô · Viva Viagem",
      categoryName: "Transporte",
      categoryIcon: "bus",
      categoryColor: 1,
      paymentMethod: "DEBIT",
      amountInCents: 320,
      currency: "EUR",
    },
  ],
};

describe("DayGroup", () => {
  it("is a section named by the day label", () => {
    render(<DayGroup {...base} />);
    expect(screen.getByRole("region", { name: "Dia 11 · 22 out" })).toBeInTheDocument();
  });

  it("lists entries and separates all but the first with a divider", () => {
    render(<DayGroup {...base} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).not.toHaveClass("border-t");
    expect(items[1]).toHaveClass("not-first:*:border-t");
  });

  it("shows the today pill and trend", () => {
    render(<DayGroup {...base} isToday trend={{ direction: "up", percent: 23 }} />);
    expect(screen.getByText("Hoje")).toBeInTheDocument();
    expect(screen.getByText("23% acima da média")).toBeInTheDocument();
  });

  it("renders actions per entry through renderActions", () => {
    render(
      <DayGroup
        {...base}
        renderActions={(id) => <button type="button" aria-label={`Editar ${id}`} />}
      />,
    );
    expect(screen.getByRole("button", { name: "Editar 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar 2" })).toBeInTheDocument();
  });

  it("makes only entries with onSelect selectable", async () => {
    const onSelect = vi.fn();
    render(
      <DayGroup
        {...base}
        entries={[{ ...base.entries[0]!, onSelect }, base.entries[1]!]}
        renderActions={(id) => <button type="button" aria-label={`Excluir ${id}`} />}
      />,
    );
    const select = screen.getByRole("button", {
      name: "Editar lançamento: Almoço no Time Out Market",
    });
    await userEvent.click(select);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: /Metrô/ })).not.toBeInTheDocument();
    expect(select).not.toContainElement(screen.getByRole("button", { name: "Excluir 1" }));
  });
});
