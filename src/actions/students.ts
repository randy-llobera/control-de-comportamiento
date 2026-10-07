"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { mapApplicationErrorToActionResult } from "@/actions/application-error-result";
import { createStudent, deleteStudent, updateStudent } from "@/lib/students";
import type { ActionResult } from "@/types/actions";
import type { CreateStudentInput, UpdateStudentInput } from "@/types/students";
import { fieldErrors } from "@/validation/form-errors";
import {
  createStudentSchema,
  deleteStudentSchema,
  updateStudentSchema,
} from "@/validation/students";

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: "Revisa los campos marcados.",
  fieldErrors: fieldErrors(error),
});

const revalidateStudentPaths = () => {
  ["/estudiantes", "/incidentes", "/dashboard"].forEach((path) =>
    revalidatePath(path),
  );
};

export const createStudentAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = createStudentSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const createInput: CreateStudentInput = parsed.data;
    await createStudent(createInput);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateStudentPaths();

  return { success: true, data: undefined };
};

export const updateStudentAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = updateStudentSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const updateInput: UpdateStudentInput = parsed.data;
    await updateStudent(updateInput);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateStudentPaths();

  return { success: true, data: undefined };
};

export const deleteStudentAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = deleteStudentSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    await deleteStudent(parsed.data.id);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateStudentPaths();

  return { success: true, data: undefined };
};
