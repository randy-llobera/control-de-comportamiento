import { describe, expect, it } from "vitest";

import { mapApplicationErrorToActionResult } from "@/actions/application-error-result";
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

  it("rethrows the original unknown error", () => {
    const error = new Error("unexpected");

    expect(() => mapApplicationErrorToActionResult(error)).toThrow(error);
  });
});
