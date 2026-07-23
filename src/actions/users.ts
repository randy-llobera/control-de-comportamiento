"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { mapApplicationErrorToActionResult } from "@/actions/application-error-result";
import { updateUserRole } from "@/lib/users";
import type { ActionResult } from "@/types/actions";
import type { UpdateUserRoleInput } from "@/types/users";

const UUID_ERROR = "Selecciona una opción válida.";
const uuidSchema = z.uuid({ error: UUID_ERROR });
const updateUserRoleSchema = z.object({
  userId: uuidSchema,
  roleId: uuidSchema,
});

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: "Revisa los campos marcados.",
  fieldErrors: z.flattenError(error).fieldErrors,
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
