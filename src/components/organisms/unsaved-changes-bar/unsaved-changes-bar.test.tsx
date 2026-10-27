import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UnsavedChangesBar } from "./unsaved-changes-bar";

describe("UnsavedChangesBar", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(
      <UnsavedChangesBar visible={false} onDiscard={() => {}} onSave={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("exposes a labelled region and fires the callbacks", async () => {
    const onDiscard = vi.fn();
    const onSave = vi.fn();
    render(<UnsavedChangesBar visible onDiscard={onDiscard} onSave={onSave} />);
    expect(screen.getByRole("region", { name: "Alterações não salvas" })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Descartar" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(onDiscard).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("disables the actions while saving", () => {
    render(<UnsavedChangesBar visible isSaving onDiscard={() => {}} onSave={() => {}} />);
    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Descartar" })).toBeDisabled();
  });
});
