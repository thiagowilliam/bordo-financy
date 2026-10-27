import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GoogleAccountCard } from "./google-account-card";

describe("GoogleAccountCard", () => {
  it("renders the default title and the e-mail", () => {
    render(<GoogleAccountCard name="Marina" email="marina@gmail.com" />);
    expect(screen.getByText("Foto da sua conta Google")).toBeInTheDocument();
    expect(screen.getByText("marina@gmail.com")).toBeInTheDocument();
  });

  it("accepts a custom title", () => {
    render(<GoogleAccountCard name="Marina" email="m@gmail.com" title="Conta conectada" />);
    expect(screen.getByText("Conta conectada")).toBeInTheDocument();
  });

  it("shows the initial without a photo", () => {
    const { container } = render(<GoogleAccountCard name="marina" email="m@gmail.com" />);
    expect(container).toHaveTextContent("M");
    expect(container.querySelector("img")).toBeNull();
  });

  it("shows a decorative photo when provided", () => {
    const { container } = render(
      <GoogleAccountCard name="Marina" email="m@gmail.com" photoUrl="/foto.jpg" />,
    );
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(container.querySelector("img")).toHaveAttribute("src", "/foto.jpg");
  });
});
