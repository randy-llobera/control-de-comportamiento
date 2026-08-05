import { describe, expect, it } from "vitest";

import {
  ApplicationError,
  AuthApplicationError,
  getAuthErrorMessage,
  getApplicationErrorMessage,
  isAuthApplicationError,
  isApplicationError,
  type ApplicationErrorCode,
} from "@/lib/application-error";

describe("ApplicationError", () => {
  it.each([
    ["unauthenticated", "Inicia sesión para continuar."],
    ["forbidden", "No autorizado."],
    ["not-found", "No se encontró el recurso solicitado."],
    [
      "conflict",
      "No se pudo completar el cambio porque entra en conflicto con otros datos.",
    ],
  ] satisfies [ApplicationErrorCode, string][])(
    "maps %s to its safe message",
    (code, message) => {
      expect(getApplicationErrorMessage(code)).toBe(message);
    },
  );

  it("recognizes application errors", () => {
    expect(isApplicationError(new ApplicationError("forbidden"))).toBe(true);
  });

  it("rejects unknown errors", () => {
    expect(isApplicationError(new Error("unexpected"))).toBe(false);
  });

  it("maps generic Auth failures to their safe message", () => {
    expect(getAuthErrorMessage("auth-failed")).toBe(
      "No se pudo completar la autenticación. Inténtalo de nuevo.",
    );
  });

  it("recognizes Auth application errors", () => {
    expect(isAuthApplicationError(new AuthApplicationError("auth-failed"))).toBe(
      true,
    );
  });
});
