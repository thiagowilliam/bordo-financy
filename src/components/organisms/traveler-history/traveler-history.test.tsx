import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TravelerHistory } from "./traveler-history";

describe("TravelerHistory", () => {
  it("renders the heading and the four metrics", () => {
    render(
      <TravelerHistory
        trips={4}
        daysTraveled={38}
        destinations={6}
        total={{ amountInCents: 1842000, currency: "BRL" }}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Seu histórico de viajante" }),
    ).toBeVisible();
    expect(screen.getByText("Viagens").nextElementSibling).toHaveTextContent("4");
    expect(screen.getByText("Dias viajados").nextElementSibling).toHaveTextContent("38");
    expect(screen.getByText("Destinos").nextElementSibling).toHaveTextContent("6");
    expect(screen.getByText("Total registrado").nextElementSibling).toHaveTextContent(
      /R\$\s?18\.420/,
    );
  });
});
