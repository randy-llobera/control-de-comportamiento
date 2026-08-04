import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginAction, logoutAction, signupAction } from "@/actions/auth";
import { AuthApplicationError } from "@/lib/application-error";

const REDIRECT_ERROR = new Error("NEXT_REDIRECT");

const mocks = vi.hoisted(() => ({
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
  signupUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  loginUser: mocks.loginUser,
  logoutUser: mocks.logoutUser,
  signupUser: mocks.signupUser,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

const createFormData = (values: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.loginUser.mockResolvedValue(undefined);
  mocks.logoutUser.mockResolvedValue(undefined);
  mocks.signupUser.mockResolvedValue(undefined);
  mocks.redirect.mockImplementation(() => {
    throw REDIRECT_ERROR;
  });
});

describe("Auth Actions", () => {
  it("rejects invalid login fields before calling the feature operation", async () => {
    await expect(
      loginAction(null, createFormData({ email: "invalid", password: "" })),
    ).resolves.toEqual({
      success: false,
      error: "Revisa los campos marcados.",
      fieldErrors: {
        email: ["Introduce un email válido."],
        password: ["Este campo es obligatorio."],
      },
    });
    expect(mocks.loginUser).not.toHaveBeenCalled();
  });

  it("rejects every invalid signup field before calling the feature operation", async () => {
    await expect(
      signupAction(
        null,
        createFormData({
          displayName: " ",
          email: "invalid",
          password: "",
          schoolRole: " ",
        }),
      ),
    ).resolves.toEqual({
      success: false,
      error: "Revisa los campos marcados.",
      fieldErrors: {
        displayName: ["Este campo es obligatorio."],
        email: ["Introduce un email válido."],
        password: ["Este campo es obligatorio."],
        schoolRole: ["Este campo es obligatorio."],
      },
    });
    expect(mocks.signupUser).not.toHaveBeenCalled();
  });

  it("maps a known Auth failure to a generic safe error", async () => {
    mocks.loginUser.mockRejectedValue(new AuthApplicationError("auth-failed"));

    await expect(
      loginAction(
        null,
        createFormData({ email: "ada@example.com", password: "secret" }),
      ),
    ).resolves.toEqual({
      success: false,
      error: "No se pudo completar la autenticación. Inténtalo de nuevo.",
    });
  });

  it("maps a known signup failure to a generic safe error", async () => {
    mocks.signupUser.mockRejectedValue(new AuthApplicationError("auth-failed"));

    await expect(
      signupAction(
        null,
        createFormData({
          displayName: "Ada Lovelace",
          email: "ada@example.com",
          password: "secret",
          schoolRole: "Tecnología",
        }),
      ),
    ).resolves.toEqual({
      success: false,
      error: "No se pudo completar la autenticación. Inténtalo de nuevo.",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("maps a known logout failure to a generic safe error", async () => {
    mocks.logoutUser.mockRejectedValue(new AuthApplicationError("auth-failed"));

    await expect(logoutAction(null, new FormData())).resolves.toEqual({
      success: false,
      error: "No se pudo completar la autenticación. Inténtalo de nuevo.",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("normalizes login input, revalidates layouts, and redirects", async () => {
    await expect(
      loginAction(
        null,
        createFormData({
          email: " ada@example.com ",
          password: " secret ",
        }),
      ),
    ).rejects.toBe(REDIRECT_ERROR);
    expect(mocks.loginUser).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: " secret ",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(mocks.redirect).toHaveBeenCalledWith("/incidentes");
  });

  it("normalizes signup input and returns success", async () => {
    await expect(
      signupAction(
        null,
        createFormData({
          displayName: " Ada Lovelace ",
          email: "ada@example.com",
          password: "secret",
          schoolRole: " Tecnología ",
        }),
      ),
    ).resolves.toEqual({
      success: true,
      data: undefined,
    });
    expect(mocks.signupUser).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret",
      displayName: "Ada Lovelace",
      schoolRole: "Tecnología",
    });
  });

  it("signs out, revalidates layouts, and redirects to Auth", async () => {
    await expect(logoutAction(null, new FormData())).rejects.toBe(
      REDIRECT_ERROR,
    );
    expect(mocks.logoutUser).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(mocks.redirect).toHaveBeenCalledWith("/auth");
  });

  it("rethrows unexpected failures", async () => {
    const error = new Error("unexpected");
    mocks.loginUser.mockRejectedValue(error);

    await expect(
      loginAction(
        null,
        createFormData({ email: "ada@example.com", password: "secret" }),
      ),
    ).rejects.toBe(error);
  });
});
