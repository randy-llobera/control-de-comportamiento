'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { mapApplicationErrorToActionResult } from '@/actions/application-error-result';
import { createStudent, deleteStudent, updateStudent } from '@/lib/students';
import type { ActionResult } from '@/types/actions';
import type { CreateStudentInput, UpdateStudentInput } from '@/types/students';

const REQUIRED_ERROR = 'Este campo es obligatorio.';
const UUID_ERROR = 'Selecciona una opción válida.';
const nameSchema = z.string({ error: REQUIRED_ERROR }).trim().min(1, {
  error: REQUIRED_ERROR,
});
const studentIdSchema = z.uuid({ error: UUID_ERROR });
const groupIdSchema = z.uuid({ error: UUID_ERROR });
const createStudentSchema = z.object({
  name: nameSchema,
  groupId: groupIdSchema,
});
const updateStudentSchema = z.object({
  id: studentIdSchema,
  name: nameSchema,
  groupId: groupIdSchema,
});
const deleteStudentSchema = z.object({ id: studentIdSchema });

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: 'Revisa los campos marcados.',
  fieldErrors: z.flattenError(error).fieldErrors,
});

const revalidateStudentPaths = () => {
  ['/estudiantes', '/incidentes', '/dashboard'].forEach((path) =>
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
