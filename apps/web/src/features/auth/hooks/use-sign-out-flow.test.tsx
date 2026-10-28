import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes";

import { useSignOutFlow } from "./use-sign-out-flow";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
beforeEach(() => useUnsavedChangesStore.setState({ hasUnsavedChanges: false }));
afterEach(() => {
  server.resetHandlers();
  replace.mockClear();
  vi.mocked(toast.error).mockClear();
});
afterAll(() => server.close());

function renderFlow() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(() => useSignOutFlow(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

describe("useSignOutFlow", () => {
  it("signs out and goes to the sign in page with the confirmation param", async () => {
    const { result } = renderFlow();
    act(() => result.current.requestSignOut());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/entrar?saiu=1"));
    expect(result.current.confirmOpen).toBe(false);
  });

  it("asks first when there are unsaved changes, and does not call the API yet", () => {
    useUnsavedChangesStore.setState({ hasUnsavedChanges: true });
    const signOutRequest = vi.fn();
    server.use(
      http.post("/api/auth/sign-out", () => {
        signOutRequest();
        return HttpResponse.json({});
      }),
    );
    const { result } = renderFlow();

    act(() => result.current.requestSignOut());
    expect(result.current.confirmOpen).toBe(true);
    expect(signOutRequest).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("signs out after the confirmation", async () => {
    useUnsavedChangesStore.setState({ hasUnsavedChanges: true });
    const { result } = renderFlow();
    act(() => result.current.requestSignOut());
    act(() => result.current.confirmSignOut());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/entrar?saiu=1"));
  });

  it("stays on the page and tells the user when signing out fails", async () => {
    server.use(http.post("/api/auth/sign-out", () => new HttpResponse(null, { status: 500 })));
    const { result } = renderFlow();
    act(() => result.current.requestSignOut());

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Não foi possível sair. Tente novamente."),
    );
    expect(replace).not.toHaveBeenCalled();
    expect(result.current.isSigningOut).toBe(false);
  });
});
