"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { mapApplicationErrorToActionResult } from "@/actions/application-error-result";
import { updateUserRole } from "@/lib/users";
import type { ActionResult } from "@/types/actions";
import type { UpdateUserRoleInput } from "@/types/users";
import { fieldErrors } from "@/validation/form-errors";
import { updateUserRoleSchema } from "@/validation/users";

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: "Revisa los campos marcados.",
  fieldErrors: fieldErrors(error),
});

export const updateUserRoleAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = updateUserRoleSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const updateInput: UpdateUserRoleInput = parsed.data;
    await updateUserRole(updateInput);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidatePath("/usuarios");

  return { success: true, data: undefined };
};
