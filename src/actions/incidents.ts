'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { mapApplicationErrorToActionResult } from '@/actions/application-error-result';
import {
  createIncident,
  deleteIncident,
  updateIncident,
} from '@/lib/incidents';
import type { ActionResult } from '@/types/actions';
import type {
  CreateIncidentInput,
  UpdateIncidentInput,
} from '@/types/incidents';

const UUID_ERROR = 'Selecciona una opción válida.';
const REQUIRED_ERROR = 'Este campo es obligatorio.';
const INVALID_DATE_ERROR = 'Introduce una fecha válida.';
const uuidSchema = z.uuid({ error: UUID_ERROR });
const dateSchema = z
  .string({ error: INVALID_DATE_ERROR })
  .trim()
  .refine(
    (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    },
    { error: INVALID_DATE_ERROR },
  );
const editableIncidentSchema = z.object({
  categoryId: uuidSchema,
  severity: z.enum(['low', 'medium', 'high'], {
    error: 'Selecciona una gravedad válida.',
  }),
  description: z
    .string({ error: REQUIRED_ERROR })
    .trim()
    .min(1, { error: REQUIRED_ERROR }),
  date: dateSchema,
});
const createIncidentSchema = editableIncidentSchema.extend({
  studentId: uuidSchema,
});
const updateIncidentSchema = editableIncidentSchema.extend({
  id: uuidSchema,
});
const deleteIncidentSchema = z.object({ id: uuidSchema });

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: 'Revisa los campos marcados.',
  fieldErrors: z.flattenError(error).fieldErrors,
});

const revalidateIncidentPaths = () => {
  ['/incidentes', '/dashboard'].forEach((path) => revalidatePath(path));
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
