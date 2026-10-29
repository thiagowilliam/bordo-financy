import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TripCover, type TripCoverProps } from "./trip-cover";

const base: TripCoverProps = {
  name: "Lisboa & Sintra",
  destination: "Portugal",
  period: "12 a 26 out 2026",
  phaseLabel: "Em andamento · Dia 11 de 15",
  coverPhotoUrl: null,
};

describe("TripCover", () => {
  it("renders the trip name as the page heading", () => {
    render(<TripCover {...base} />);
    expect(screen.getByRole("heading", { level: 1, name: "Lisboa & Sintra" })).toBeInTheDocument();
  });

  it("shows phase, destination and period", () => {
    render(<TripCover {...base} />);
    expect(screen.getByText("Em andamento · Dia 11 de 15")).toBeInTheDocument();
    expect(screen.getByText("Portugal")).toBeInTheDocument();
    expect(screen.getByText("12 a 26 out 2026")).toBeInTheDocument();
  });

  it("renders no image without a cover photo", () => {
    render(<TripCover {...base} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the cover as decorative when present", () => {
    const { container } = render(
      <TripCover
        {...base}
        coverPhotoUrl="https://images.unsplash.com/photo-1541322841511-e0aed2019f2a"
      />,
    );
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("renders the action beside the phase pill", () => {
    render(<TripCover {...base} action={<button type="button">Opções</button>} />);
    expect(screen.getByRole("button", { name: "Opções" })).toBeInTheDocument();
  });
});
