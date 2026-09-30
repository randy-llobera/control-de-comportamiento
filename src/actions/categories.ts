"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { mapApplicationErrorToActionResult } from "@/actions/application-error-result";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/categories";
import type { ActionResult } from "@/types/actions";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/categories";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "@/validation/categories";
import { fieldErrors } from "@/validation/form-errors";

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: "Revisa los campos marcados.",
  fieldErrors: fieldErrors(error),
});

const revalidateCategoryPaths = () => {
  ["/categorias", "/incidentes", "/dashboard"].forEach((path) =>
    revalidatePath(path),
  );
};

export const createCategoryAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = createCategorySchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const createInput: CreateCategoryInput = parsed.data;
    await createCategory(createInput);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateCategoryPaths();

  return { success: true, data: undefined };
};

export const updateCategoryAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = updateCategorySchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const updateInput: UpdateCategoryInput = parsed.data;
    await updateCategory(updateInput);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateCategoryPaths();

  return { success: true, data: undefined };
};

export const deleteCategoryAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = deleteCategorySchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    await deleteCategory(parsed.data.id);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateCategoryPaths();

  return { success: true, data: undefined };
};
