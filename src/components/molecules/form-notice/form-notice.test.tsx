import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormNotice } from "./form-notice";

describe("FormNotice", () => {
  it("renders the message as a status", () => {
    render(<FormNotice>Link enviado</FormNotice>);
    expect(screen.getByRole("status")).toHaveTextContent("Link enviado");
  });

  it("merges a custom class name", () => {
    render(<FormNotice className="mt-2">Ok</FormNotice>);
    expect(screen.getByRole("status")).toHaveClass("mt-2");
  });

  it("renders error and warning tones as alerts", () => {
    render(
      <>
        <FormNotice tone="error">Senha incorreta</FormNotice>
        <FormNotice tone="warning" compact>
          Sessão expirando
        </FormNotice>
      </>,
    );
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent("Senha incorreta");
    expect(alerts[1]).toHaveTextContent("Sessão expirando");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps success as status in compact mode", () => {
    render(
      <FormNotice compact tone="success">
        Salvo
      </FormNotice>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Salvo");
  });
});
