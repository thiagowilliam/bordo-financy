import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TripSection } from "./trip-section";

describe("TripSection", () => {
  it("labels the region with its heading and lists the children", () => {
    render(
      <TripSection title="Próximas" count={2}>
        <a href="/a">A</a>
        <a href="/b">B</a>
      </TripSection>,
    );
    expect(screen.getByRole("region", { name: "Próximas" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
