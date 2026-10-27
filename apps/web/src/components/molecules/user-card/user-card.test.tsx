import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserCard } from "./user-card";

describe("UserCard", () => {
  it("renders name, email and initial", () => {
    const { container } = render(<UserCard name="Marina" email="marina@email.com" />);
    expect(screen.getByText("Marina")).toBeInTheDocument();
    expect(screen.getByText("marina@email.com")).toBeInTheDocument();
    expect(container).toHaveTextContent("M");
  });
});
