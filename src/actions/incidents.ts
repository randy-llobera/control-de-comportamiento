'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { mapApplicationErrorToActionResult } from '@/actions/application-error-result';
import { createIncident } from '@/lib/incidents';
import type { ActionResult } from '@/types/actions';
import type { CreateIncidentInput } from '@/types/incidents';

const UUID_ERROR = 'Selecciona una opción válida.';
const REQUIRED_ERROR = 'Este campo es obligatorio.';
const INVALID_DATE_ERROR = 'Introduce una fecha válida.';
const uuidSchema = z.uuid({ error: UUID_ERROR });
const dateSchema = z
  .string({ error: INVALID_DATE_ERROR })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: INVALID_DATE_ERROR })
  .refine(
    (value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    },
    { error: INVALID_DATE_ERROR },
  );
const createIncidentSchema = z.object({
  studentId: uuidSchema,
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

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: 'Revisa los campos marcados.',
  fieldErrors: z.flattenError(error).fieldErrors,
});

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

  ['/incidentes', '/dashboard'].forEach((path) => revalidatePath(path));

  return { success: true, data: undefined };
};
