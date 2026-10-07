import { z } from "zod";

import { INCIDENT_SEVERITIES } from "@/types/incidents";

const UUID_ERROR = "Selecciona una opción válida.";
const REQUIRED_ERROR = "Este campo es obligatorio.";
const INVALID_DATE_ERROR = "Introduce una fecha válida.";
const uuidSchema = z.uuid({ error: UUID_ERROR });
const dateSchema = z
  .string({ error: INVALID_DATE_ERROR })
  .trim()
  .refine(
    (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
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
  severity: z.enum(INCIDENT_SEVERITIES, {
    error: "Selecciona una gravedad válida.",
  }),
  description: z
    .string({ error: REQUIRED_ERROR })
    .trim()
    .min(1, { error: REQUIRED_ERROR }),
  date: dateSchema,
});

export const createIncidentSchema = editableIncidentSchema.extend({
  studentId: uuidSchema,
});
export const updateIncidentSchema = editableIncidentSchema.extend({
  id: uuidSchema,
});
export const deleteIncidentSchema = z.object({ id: uuidSchema });
