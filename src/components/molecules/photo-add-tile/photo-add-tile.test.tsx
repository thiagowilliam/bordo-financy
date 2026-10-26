import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PhotoAddTile } from "./photo-add-tile";

const file = new File(["x"], "a.png", { type: "image/png" });

describe("PhotoAddTile", () => {
  it("is a button named Adicionar fotos", () => {
    render(<PhotoAddTile onFiles={() => {}} />);
    expect(screen.getByRole("button", { name: /Adicionar fotos/ })).toBeInTheDocument();
  });

  it("accepts only jpg and png and reports picked files", async () => {
    const onFiles = vi.fn();
    render(<PhotoAddTile onFiles={onFiles} />);
    const input = screen.getByTestId("photo-add-input");
    expect(input).toHaveAttribute("accept", "image/jpeg,image/png");
    expect(input).toHaveAttribute("multiple");
    await userEvent.upload(input, file);
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("reports dropped files", () => {
    const onFiles = vi.fn();
    render(<PhotoAddTile onFiles={onFiles} />);
    const button = screen.getByRole("button", { name: /Adicionar fotos/ });
    fireEvent.drop(button, { dataTransfer: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("ignores drops when disabled", () => {
    const onFiles = vi.fn();
    render(<PhotoAddTile onFiles={onFiles} disabled />);
    fireEvent.drop(screen.getByRole("button", { name: /Adicionar fotos/ }), {
      dataTransfer: { files: [file] },
    });
    expect(onFiles).not.toHaveBeenCalled();
  });
});
