import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it } from "vitest";

import { DescriptionField } from "./description-field";

describe("DescriptionField", () => {
  it("labels the textarea with the default label", () => {
    render(<DescriptionField placeholder="Ex.: almoço" />);
    expect(screen.getByRole("textbox", { name: "Descrição (opcional)" })).toHaveAttribute(
      "placeholder",
      "Ex.: almoço",
    );
  });

  it("accepts a custom label", () => {
    render(<DescriptionField label="Observação" />);
    expect(screen.getByLabelText("Observação")).toBeInTheDocument();
  });

  it("is controlled", async () => {
    function Harness() {
      const [value, setValue] = useState("");
      return <DescriptionField value={value} onChange={(event) => setValue(event.target.value)} />;
    }
    render(<Harness />);
    await userEvent.type(screen.getByRole("textbox"), "Café");
    expect(screen.getByRole("textbox")).toHaveValue("Café");
  });

  it("forwards the ref", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<DescriptionField ref={ref} />);
    expect(ref.current).toBe(screen.getByRole("textbox"));
  });

  it("shows the error", () => {
    render(<DescriptionField error="Muito longa" />);
    expect(screen.getByRole("textbox")).toBeInvalid();
    expect(screen.getByRole("alert")).toHaveTextContent("Muito longa");
  });
});
