import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProfileInfoSection, type ProfileInfoSectionProps } from "./profile-info-section";

const base: ProfileInfoSectionProps = {
  name: "Marina",
  onNameChange: () => {},
  currency: "BRL",
  onCurrencyChange: () => {},
  email: "marina@exemplo.com",
  emailVerified: true,
  onChangeEmail: () => {},
};

describe("ProfileInfoSection", () => {
  it("renders the heading, name field and hint", () => {
    render(<ProfileInfoSection {...base} />);
    expect(screen.getByRole("heading", { level: 2, name: "Informações pessoais" })).toBeVisible();
    expect(screen.getByLabelText("Nome")).toHaveValue("Marina");
    expect(screen.getByText("Usada para somar viagens em moedas diferentes.")).toBeVisible();
  });

  it("reports name changes", async () => {
    const onNameChange = vi.fn();
    render(<ProfileInfoSection {...base} onNameChange={onNameChange} />);
    await userEvent.type(screen.getByLabelText("Nome"), "a");
    expect(onNameChange).toHaveBeenCalledWith("Marinaa");
  });

  it("shows the name error", () => {
    render(<ProfileInfoSection {...base} nameError="Informe seu nome." />);
    expect(screen.getByLabelText("Nome")).toHaveAccessibleDescription("Informe seu nome.");
  });

  it("shows the verified badge only when verified", () => {
    const { rerender } = render(<ProfileInfoSection {...base} />);
    expect(screen.getByText("Verificado")).toBeVisible();
    rerender(<ProfileInfoSection {...base} emailVerified={false} />);
    expect(screen.queryByText("Verificado")).not.toBeInTheDocument();
  });

  it("calls onChangeEmail", async () => {
    const onChangeEmail = vi.fn();
    render(<ProfileInfoSection {...base} onChangeEmail={onChangeEmail} />);
    await userEvent.click(screen.getByRole("button", { name: "Alterar" }));
    expect(onChangeEmail).toHaveBeenCalledOnce();
  });
});
