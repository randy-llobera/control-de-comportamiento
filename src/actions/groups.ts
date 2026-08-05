'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { mapApplicationErrorToActionResult } from '@/actions/application-error-result';
import { createGroup, deleteGroup, updateGroup } from '@/lib/groups';
import type { ActionResult } from '@/types/actions';
import type { CreateGroupInput, UpdateGroupInput } from '@/types/groups';

const REQUIRED_ERROR = 'Este campo es obligatorio.';
const UUID_ERROR = 'Selecciona una opción válida.';
const nameSchema = z.string({ error: REQUIRED_ERROR }).trim().min(1, {
  error: REQUIRED_ERROR,
});
const groupIdSchema = z.uuid({ error: UUID_ERROR });
const createGroupSchema = z.object({ name: nameSchema });
const updateGroupSchema = z.object({ id: groupIdSchema, name: nameSchema });
const deleteGroupSchema = z.object({ id: groupIdSchema });

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: 'Revisa los campos marcados.',
  fieldErrors: z.flattenError(error).fieldErrors,
});

const revalidateGroupPaths = () => {
  ['/grupos', '/estudiantes', '/incidentes', '/dashboard'].forEach((path) =>
    revalidatePath(path),
  );
};

export const createGroupAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = createGroupSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const createInput: CreateGroupInput = parsed.data;
    await createGroup(createInput);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateGroupPaths();

  return { success: true, data: undefined };
};

export const updateGroupAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = updateGroupSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    const updateInput: UpdateGroupInput = parsed.data;
    await updateGroup(updateInput);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateGroupPaths();

  return { success: true, data: undefined };
};

export const deleteGroupAction = async (
  input: unknown,
): Promise<ActionResult> => {
  const parsed = deleteGroupSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  try {
    await deleteGroup(parsed.data.id);
  } catch (error) {
    return mapApplicationErrorToActionResult(error);
  }

  revalidateGroupPaths();

  return { success: true, data: undefined };
};
