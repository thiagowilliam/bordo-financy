import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TripMini } from "./trip-mini";

describe("TripMini", () => {
  it("renders name and period", () => {
    render(<TripMini name="Lisboa" period="12 – 26 out" coverPhotoUrl={null} />);
    expect(screen.getByText("Lisboa")).toBeInTheDocument();
    expect(screen.getByText("12 – 26 out")).toBeInTheDocument();
  });

  it("renders the cover only when there is one", () => {
    const { container, rerender } = render(
      <TripMini name="Lisboa" period="12 – 26 out" coverPhotoUrl={null} />,
    );
    expect(container.querySelector("img")).toBeNull();
    rerender(<TripMini name="Lisboa" period="12 – 26 out" coverPhotoUrl="/capa.jpg" />);
    expect(container.querySelector("img")).not.toBeNull();
  });
});
