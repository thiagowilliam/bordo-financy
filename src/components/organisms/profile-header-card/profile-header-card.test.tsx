import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProfileHeaderCard } from "./profile-header-card";

const base = {
  name: "Marina Alves",
  email: "marina@exemplo.com",
  memberSince: "março de 2026",
  onChangePhoto: () => {},
};

describe("ProfileHeaderCard", () => {
  it("renders name, email and member since", () => {
    render(<ProfileHeaderCard {...base} />);
    expect(screen.getByRole("heading", { name: "Marina Alves" })).toBeInTheDocument();
    expect(screen.getByText("marina@exemplo.com")).toBeInTheDocument();
    expect(screen.getByText("No Bordo desde março de 2026")).toBeInTheDocument();
  });

  it("calls onChangePhoto from the camera button", async () => {
    const onChangePhoto = vi.fn();
    render(<ProfileHeaderCard {...base} onChangePhoto={onChangePhoto} />);
    await userEvent.click(screen.getByRole("button", { name: "Trocar foto" }));
    expect(onChangePhoto).toHaveBeenCalledOnce();
  });

  it("renders the photo when photoUrl is set", () => {
    const { container } = render(<ProfileHeaderCard {...base} photoUrl="/foto.jpg" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/foto.jpg");
  });
});
