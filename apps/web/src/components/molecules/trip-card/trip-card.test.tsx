import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TripCard, type TripCardProps } from "./trip-card";

const base: TripCardProps<"/viagens/trip-1"> = {
  href: "/viagens/trip-1",
  name: "Lisboa & Sintra",
  destination: "Portugal",
  period: "12 – 26 out",
  badgeLabel: "Dia 11 de 15",
  coverPhotoUrl: null,
  spentInCents: 362130,
  budgetInCents: 500000,
  currency: "EUR",
};

describe("TripCard", () => {
  it("is a single link named after the trip", () => {
    render(<TripCard {...base} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    const link = screen.getByRole("link", { name: /Lisboa & Sintra/ });
    expect(link).toHaveAttribute("href", "/viagens/trip-1");
  });

  it("shows destination, period, badge and money", () => {
    render(<TripCard {...base} />);
    expect(screen.getByText("Portugal · 12 – 26 out")).toBeInTheDocument();
    expect(screen.getByText("Dia 11 de 15")).toBeInTheDocument();
    expect(screen.getByText("€ 3.621,30")).toBeInTheDocument();
    expect(screen.getByText("€ 5.000")).toBeInTheDocument();
    expect(screen.getByText("72% usado")).toHaveClass("text-success-ink");
    expect(screen.getByText("restantes", { exact: false })).toBeInTheDocument();
  });

  it("flags the warning range", () => {
    render(<TripCard {...base} spentInCents={420000} />);
    expect(screen.getByText("84% usado")).toHaveClass("text-warning-ink");
    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass("bg-warning");
  });

  it("shows the overspend when over budget", () => {
    render(<TripCard {...base} spentInCents={550000} />);
    expect(screen.getByText("110% usado")).toHaveClass("text-destructive-ink");
    expect(screen.getByText("acima", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText("restantes", { exact: false })).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("renders the cover image only when there is a photo", () => {
    const { container, rerender } = render(<TripCard {...base} />);
    expect(container.querySelector("img")).toBeNull();
    rerender(<TripCard {...base} coverPhotoUrl="https://images.unsplash.com/photo-1" />);
    expect(container.querySelector("img")).not.toBeNull();
  });
});
