import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateUserRoleAction } from "@/actions/users";
import { ApplicationError } from "@/lib/application-error";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  updateUserRole: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/users", () => ({
  updateUserRole: mocks.updateUserRole,
}));

const USER_ID = "22222222-2222-4222-8222-222222222222";
const ROLE_ID = "33333333-3333-4333-8333-333333333333";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateUserRoleAction", () => {
  it("rejects invalid input without calling the feature operation", async () => {
    const result = await updateUserRoleAction({
      userId: "invalid",
      roleId: ROLE_ID,
    });

    expect(result).toEqual({
      success: false,
      error: "Revisa los campos marcados.",
      fieldErrors: {
        userId: ["Selecciona una opción válida."],
      },
    });
    expect(mocks.updateUserRole).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("maps known feature failures to safe Action results", async () => {
    mocks.updateUserRole.mockRejectedValue(new ApplicationError("not-found"));

    await expect(
      updateUserRoleAction({ userId: USER_ID, roleId: ROLE_ID }),
    ).resolves.toEqual({
      success: false,
      error: "No se encontró el recurso solicitado.",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rethrows unexpected feature failures", async () => {
    const error = new Error("unexpected");
    mocks.updateUserRole.mockRejectedValue(error);

    await expect(
      updateUserRoleAction({ userId: USER_ID, roleId: ROLE_ID }),
    ).rejects.toThrow(error);
  });

  it("invalidates only the users route after a successful update", async () => {
    mocks.updateUserRole.mockResolvedValue(undefined);

    await expect(
      updateUserRoleAction({ userId: USER_ID, roleId: ROLE_ID }),
    ).resolves.toEqual({ success: true, data: undefined });
    expect(mocks.updateUserRole).toHaveBeenCalledWith({
      userId: USER_ID,
      roleId: ROLE_ID,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/usuarios");
  });
});
