"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { mapApplicationErrorToActionResult } from "@/actions/application-error-result";
import {
  createIncident,
  deleteIncident,
  updateIncident,
} from "@/lib/incidents";
import type { ActionResult } from "@/types/actions";
import type {
  CreateIncidentInput,
  UpdateIncidentInput,
} from "@/types/incidents";
import { fieldErrors } from "@/validation/form-errors";
import {
  createIncidentSchema,
  deleteIncidentSchema,
  updateIncidentSchema,
} from "@/validation/incidents";

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: "Revisa los campos marcados.",
  fieldErrors: fieldErrors(error),
});

const revalidateIncidentPaths = () => {
  ["/incidentes", "/dashboard"].forEach((path) => revalidatePath(path));
};

export const createIncidentAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = createIncidentSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const createInput: CreateIncidentInput = parsed.data;
    await createIncident(createInput);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateIncidentPaths();

  return { success: true, data: undefined };
};

export const updateIncidentAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = updateIncidentSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const updateInput: UpdateIncidentInput = parsed.data;
    await updateIncident(updateInput);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateIncidentPaths();

  return { success: true, data: undefined };
};

export const deleteIncidentAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = deleteIncidentSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    await deleteIncident(parsed.data.id);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateIncidentPaths();

  return { success: true, data: undefined };
};
