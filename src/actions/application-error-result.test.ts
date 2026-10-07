import { describe, expect, it, vi } from "vitest";

import {
  CRUD_ACTION_FAILURE_MESSAGE,
  mapApplicationErrorToActionResult,
} from "@/actions/application-error-result";
import {
  ApplicationError,
  type ApplicationErrorCode,
} from "@/lib/application-error";

describe("mapApplicationErrorToActionResult", () => {
  it.each([
    ["unauthenticated", "Inicia sesión para continuar."],
    ["forbidden", "No autorizado."],
    ["not-found", "No se encontró el recurso solicitado."],
    [
      "conflict",
      "No se pudo completar el cambio porque entra en conflicto con otros datos.",
    ],
  ] satisfies [ApplicationErrorCode, string][])(
    "maps %s to an Action failure",
    (code, message) => {
      expect(
        mapApplicationErrorToActionResult(new ApplicationError(code)),
      ).toEqual({
        success: false,
        error: message,
      });
    },
  );

  it("returns a safe result and logs unknown errors", () => {
    const error = new Error("unexpected");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(mapApplicationErrorToActionResult(error)).toEqual({
      success: false,
      error: CRUD_ACTION_FAILURE_MESSAGE,
    });
    expect(consoleError).toHaveBeenCalledWith(
      "Unexpected CRUD Action failure:",
      error,
    );
    expect(CRUD_ACTION_FAILURE_MESSAGE).not.toContain(error.message);

    consoleError.mockRestore();
  });
});
