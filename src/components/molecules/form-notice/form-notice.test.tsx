import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormNotice } from "./form-notice";

describe("FormNotice", () => {
  it("renders the message as a status", () => {
    render(<FormNotice>Link enviado</FormNotice>);
    expect(screen.getByRole("status")).toHaveTextContent("Link enviado");
  });

  it("merges a custom class name", () => {
    render(<FormNotice className="mt-2">Ok</FormNotice>);
    expect(screen.getByRole("status")).toHaveClass("mt-2");
  });
});
