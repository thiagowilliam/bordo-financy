import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { DateField, type DateFieldProps } from "./date-field";

function Harness(props: Partial<DateFieldProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <>
      <label htmlFor="date">Data de ida</label>
      <DateField id="date" {...props} value={value} onChange={setValue} />
    </>
  );
}

describe("DateField", () => {
  it("shows the placeholder, then the picked date as dd/MM/yyyy", async () => {
    render(<Harness defaultMonth="2027-05-01" />);
    const trigger = screen.getByRole("button", { name: /Data de ida/ });
    expect(trigger).toHaveTextContent("dd/mm/aaaa");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: /(^|\D)15 de maio de 2027/ }));
    expect(screen.getByRole("button", { name: /Data de ida/ })).toHaveTextContent("15/05/2027");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("disables days before the min date", async () => {
    render(<Harness minDate="2027-05-10" />);
    await userEvent.click(screen.getByRole("button", { name: /Data de ida/ }));
    expect(screen.getByRole("button", { name: /(^|\D)9 de maio de 2027/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /(^|\D)10 de maio de 2027/ })).toBeEnabled();
  });

  it("is keyboard operable", async () => {
    render(<Harness defaultMonth="2027-05-01" />);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: /Data de ida/ })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("grid")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("forwards aria-invalid", () => {
    render(<Harness aria-invalid />);
    expect(screen.getByRole("button", { name: /Data de ida/ })).toBeInvalid();
  });
});
