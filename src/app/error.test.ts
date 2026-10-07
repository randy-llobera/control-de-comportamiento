import { describe, expect, it, vi } from "vitest";

import ErrorBoundary from "@/app/error";

describe("App error boundary", () => {
  it("renders safe feedback without exposing the original error", () => {
    const rendered = ErrorBoundary({
      error: new Error("provider secret"),
      reset: vi.fn(),
    });

    expect(rendered).toMatchObject({
      type: "main",
    });
    expect(JSON.stringify(rendered)).toContain(
      "No se pudo cargar esta página. Inténtalo de nuevo.",
    );
    expect(JSON.stringify(rendered)).not.toContain("provider secret");
  });

  it("passes the retry action to the button", () => {
    const reset = vi.fn();
    const rendered = ErrorBoundary({ error: new Error("unexpected"), reset });
    const mainChildren = rendered.props.children;
    const contentChildren = mainChildren.props.children;
    const button = contentChildren[2];

    button.props.onClick();

    expect(reset).toHaveBeenCalledOnce();
  });
});
