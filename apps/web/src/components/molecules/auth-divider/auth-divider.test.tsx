import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthDivider } from "./auth-divider";

describe("AuthDivider", () => {
  it("renders 'ou' by default", () => {
    render(<AuthDivider />);
    expect(screen.getByText("ou")).toBeInTheDocument();
  });

  it("renders custom children", () => {
    render(<AuthDivider>ou continue com</AuthDivider>);
    expect(screen.getByText("ou continue com")).toBeInTheDocument();
  });
});
