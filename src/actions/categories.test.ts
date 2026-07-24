import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/categories";
import { ApplicationError } from "@/lib/application-error";

const mocks = vi.hoisted(() => ({
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  revalidatePath: vi.fn(),
  updateCategory: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/categories", () => ({
  createCategory: mocks.createCategory,
  deleteCategory: mocks.deleteCategory,
  updateCategory: mocks.updateCategory,
}));

const CATEGORY_ID = "22222222-2222-4222-8222-222222222222";
const CATEGORY_PATHS = ["/categorias", "/incidentes", "/dashboard"];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("category Actions", () => {
  it("rejects invalid create input before calling the feature operation", async () => {
    await expect(createCategoryAction({ name: " " })).resolves.toEqual({
      success: false,
      error: "Revisa los campos marcados.",
      fieldErrors: { name: ["Este campo es obligatorio."] },
    });
    expect(mocks.createCategory).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("maps known feature failures to a safe Spanish result", async () => {
    mocks.updateCategory.mockRejectedValue(new ApplicationError("conflict"));

    await expect(
      updateCategoryAction({ id: CATEGORY_ID, name: "Convivencia" }),
    ).resolves.toEqual({
      success: false,
      error:
        "No se pudo completar el cambio porque entra en conflicto con otros datos.",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects an invalid update identifier before calling the feature operation", async () => {
    await expect(
      updateCategoryAction({ id: "invalid", name: "Convivencia" }),
    ).resolves.toEqual({
      success: false,
      error: "Revisa los campos marcados.",
      fieldErrors: { id: ["Selecciona una opción válida."] },
    });
    expect(mocks.updateCategory).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects an invalid delete identifier before calling the feature operation", async () => {
    await expect(deleteCategoryAction({ id: "invalid" })).resolves.toEqual({
      success: false,
      error: "Revisa los campos marcados.",
      fieldErrors: { id: ["Selecciona una opción válida."] },
    });
    expect(mocks.deleteCategory).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rethrows unexpected feature failures", async () => {
    const error = new Error("unexpected");
    mocks.deleteCategory.mockRejectedValue(error);

    await expect(deleteCategoryAction({ id: CATEGORY_ID })).rejects.toThrow(
      error,
    );
  });

  it.each([
    [
      "create",
      createCategoryAction,
      { name: " Convivencia " },
      mocks.createCategory,
      { name: "Convivencia" },
    ],
    [
      "update",
      updateCategoryAction,
      { id: CATEGORY_ID, name: " Respeto " },
      mocks.updateCategory,
      { id: CATEGORY_ID, name: "Respeto" },
    ],
    [
      "delete",
      deleteCategoryAction,
      { id: CATEGORY_ID },
      mocks.deleteCategory,
      CATEGORY_ID,
    ],
  ] as const)(
    "invalidates affected routes after a successful %s",
    async (
      _operation,
      action,
      input,
      featureOperation,
      expectedFeatureInput,
    ) => {
      featureOperation.mockResolvedValue(undefined);

      await expect(action(input)).resolves.toEqual({
        success: true,
        data: undefined,
      });
      expect(featureOperation).toHaveBeenCalledWith(expectedFeatureInput);
      expect(mocks.revalidatePath).toHaveBeenCalledTimes(CATEGORY_PATHS.length);
      expect(mocks.revalidatePath.mock.calls.map(([path]) => path)).toEqual(
        CATEGORY_PATHS,
      );
    },
  );
});
