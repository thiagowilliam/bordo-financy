import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { PhotoUploadDialog, type PhotoUploadDialogProps } from "./photo-upload-dialog";

vi.mock("@/components/molecules/photo-cropper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/molecules/photo-cropper")>()),
  cropImageToBlob: vi.fn(async () => new Blob(["x"], { type: "image/jpeg" })),
}));

function setup(props: Partial<PhotoUploadDialogProps> = {}) {
  const onSave = vi.fn();
  const onRemove = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <PhotoUploadDialog
      open
      onOpenChange={onOpenChange}
      hasPhoto={false}
      onSave={onSave}
      onRemove={onRemove}
      {...props}
    />,
  );
  return { onSave, onRemove, onOpenChange };
}

const input = () => screen.getByLabelText("Arquivo de imagem");
const png = () => new File(["a"], "foto.png", { type: "image/png" });
const save = () => screen.getByRole("button", { name: /Salvar foto|Salvando/ });

describe("PhotoUploadDialog", () => {
  it("starts on the choose step with Salvar foto disabled", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Trocar foto" })).toHaveAccessibleDescription(
      "Escolha uma imagem para o seu perfil.",
    );
    expect(save()).toBeDisabled();
    expect(screen.getByText("JPG, PNG ou WEBP, até 5 MB")).toBeInTheDocument();
  });

  it("shows Remover foto only when there is a photo", async () => {
    const { onRemove } = setup({ hasPhoto: true });
    await userEvent.click(screen.getByRole("button", { name: "Remover foto" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("hides Remover foto without a photo", () => {
    setup();
    expect(screen.queryByRole("button", { name: "Remover foto" })).not.toBeInTheDocument();
  });

  it("rejects invalid files with an alert", async () => {
    setup();
    const user = userEvent.setup({ applyAccept: false });
    await user.upload(input(), new File(["a"], "x.gif", { type: "image/gif" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Use JPG, PNG ou WEBP de até 5 MB.");
    expect(screen.getByRole("dialog", { name: "Trocar foto" })).toBeInTheDocument();
  });

  it("rejects files above 5 MB", async () => {
    setup();
    const big = new File(["a"], "big.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: 6 * 1024 * 1024 });
    await userEvent.upload(input(), big);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("goes to the crop step and back with Escolher outra", async () => {
    setup();
    await userEvent.upload(input(), png());
    expect(screen.getByRole("dialog", { name: "Ajustar foto" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Zoom" })).toBeInTheDocument();
    expect(screen.getByText("PRÉVIA")).toBeInTheDocument();
    expect(save()).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Escolher outra" }));
    expect(screen.getByRole("dialog", { name: "Trocar foto" })).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("crops and calls onSave with a File", async () => {
    const { onSave } = setup();
    await userEvent.upload(input(), png());
    await userEvent.click(save());
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const photo = onSave.mock.calls[0]?.[0] as File;
    expect(photo).toBeInstanceOf(File);
    expect(photo.type).toBe("image/jpeg");
  });

  it("disables buttons and blocks closing while pending", async () => {
    const { onOpenChange } = setup({ isPending: true, hasPhoto: true });
    expect(save()).toHaveTextContent("Salvando...");
    expect(save()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remover foto" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("shows a server error", () => {
    setup({ error: "Falhou" });
    expect(screen.getByRole("alert")).toHaveTextContent("Falhou");
  });

  it("resets to the choose step after closing", async () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button onClick={() => setOpen(true)}>abrir</button>
          <PhotoUploadDialog
            open={open}
            onOpenChange={setOpen}
            hasPhoto={false}
            onSave={() => {}}
            onRemove={() => {}}
          />
        </>
      );
    }
    render(<Harness />);
    await userEvent.upload(input(), png());
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await userEvent.click(screen.getByRole("button", { name: "abrir" }));
    expect(screen.getByRole("dialog", { name: "Trocar foto" })).toBeInTheDocument();
  });
});
