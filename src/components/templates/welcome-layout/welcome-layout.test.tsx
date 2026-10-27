import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WelcomeLayout } from "./welcome-layout";

const base = {
  imageSrc: "https://images.unsplash.com/photo-1.jpg",
  quote: "Cada viagem conta",
  place: "Lisboa",
};

describe("WelcomeLayout", () => {
  it("renders a main with quote, place and children", () => {
    render(
      <WelcomeLayout {...base}>
        <button type="button">Continuar</button>
      </WelcomeLayout>,
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("Cada viagem conta")).toBeInTheDocument();
    expect(screen.getByText("Lisboa")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });

  it("renders the photos as decorative images", () => {
    const { container } = render(<WelcomeLayout {...base}>x</WelcomeLayout>);
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThan(0);
    images.forEach((img) => expect(img).toHaveAttribute("alt", ""));
  });

  it("renders the footer only when provided", () => {
    const { rerender } = render(<WelcomeLayout {...base}>x</WelcomeLayout>);
    expect(screen.queryByText("Rodapé")).toBeNull();
    rerender(
      <WelcomeLayout {...base} footer="Rodapé">
        x
      </WelcomeLayout>,
    );
    expect(screen.getByText("Rodapé")).toBeInTheDocument();
  });
});
