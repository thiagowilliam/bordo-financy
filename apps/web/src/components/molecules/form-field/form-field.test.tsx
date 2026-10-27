import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextField } from "@/components/atoms/text-field";

import { FormField } from "./form-field";

describe("FormField", () => {
  it("associates the label with the control", () => {
    render(<FormField label="Destino">{(control) => <TextField {...control} />}</FormField>);
    expect(screen.getByLabelText("Destino")).toBeInTheDocument();
  });

  it("describes the control with the error and marks it invalid", () => {
    render(
      <FormField label="Destino" error="Informe o destino">
        {(control) => <TextField {...control} />}
      </FormField>,
    );
    const input = screen.getByLabelText("Destino");
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Informe o destino");
  });

  it("shows the hint when there is no error", () => {
    render(
      <FormField label="Destino" hint="País ou cidade">
        {(control) => <TextField {...control} />}
      </FormField>,
    );
    expect(screen.getByLabelText("Destino")).toBeValid();
    expect(screen.getByLabelText("Destino")).toHaveAccessibleDescription("País ou cidade");
  });
});
