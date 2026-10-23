import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PhotoPicker } from "./photo-picker";

const jpg = (name: string) => new File(["x"], name, { type: "image/jpeg" });
const input = () => screen.getByLabelText("Escolher fotos");
const items = () => screen.getAllByRole("listitem");

describe("PhotoPicker", () => {
  it("shows thumbnails and makes the first photo the cover", async () => {
    render(<PhotoPicker />);
    await userEvent.upload(input(), [jpg("a.jpg"), jpg("b.jpg")]);
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(within(items()[0]).getByText("Capa")).toBeInTheDocument();
    expect(within(items()[1]).getByRole("button", { name: "Definir capa" })).toBeInTheDocument();
  });

  it("moves the cover to the chosen photo", async () => {
    const onChange = vi.fn();
    render(<PhotoPicker onChange={onChange} />);
    await userEvent.upload(input(), [jpg("a.jpg"), jpg("b.jpg")]);
    await userEvent.click(screen.getByRole("button", { name: "Definir capa" }));
    expect(within(items()[1]).getByText("Capa")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ coverIndex: 1 }));
  });

  it("ignores invalid files and explains why", async () => {
    render(<PhotoPicker />);
    await userEvent.upload(
      input(),
      [jpg("a.jpg"), new File(["x"], "doc.pdf", { type: "application/pdf" })],
      {
        applyAccept: false,
      },
    );
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Algumas fotos foram ignoradas: use JPG ou PNG de até 10 MB.",
    );
  });

  it("removes a photo, revokes its URL and promotes the next one when it was the cover", async () => {
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    render(<PhotoPicker />);
    await userEvent.upload(input(), [jpg("a.jpg"), jpg("b.jpg")]);
    await userEvent.click(screen.getAllByRole("button", { name: "Remover foto" })[0]);
    expect(revoke).toHaveBeenCalledOnce();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("img", { name: "b.jpg" })).toBeInTheDocument();
    expect(screen.getByText("Capa")).toBeInTheDocument();
  });

  it("opens the picker from the add more tile", async () => {
    render(<PhotoPicker />);
    await userEvent.upload(input(), jpg("a.jpg"));
    const click = vi.spyOn(input() as HTMLInputElement, "click");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar mais fotos" }));
    expect(click).toHaveBeenCalled();
  });

  it("stops at 10 photos", async () => {
    render(<PhotoPicker />);
    await userEvent.upload(
      input(),
      Array.from({ length: 11 }, (_, i) => jpg(`${i}.jpg`)),
    );
    expect(screen.getAllByRole("img")).toHaveLength(10);
    expect(screen.getByRole("alert")).toHaveTextContent("Você pode adicionar até 10 fotos.");
    expect(screen.queryByRole("button", { name: "Adicionar mais fotos" })).not.toBeInTheDocument();
  });

  it("revokes every URL on unmount", async () => {
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    const { unmount } = render(<PhotoPicker />);
    await userEvent.upload(input(), [jpg("a.jpg"), jpg("b.jpg")]);
    unmount();
    expect(revoke).toHaveBeenCalledTimes(2);
  });
});
