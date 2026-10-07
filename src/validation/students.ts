import { z } from "zod";

const REQUIRED_ERROR = "Este campo es obligatorio.";
const UUID_ERROR = "Selecciona una opción válida.";
const nameSchema = z
  .string({ error: REQUIRED_ERROR })
  .trim()
  .min(1, { error: REQUIRED_ERROR });
const studentIdSchema = z.uuid({ error: UUID_ERROR });
const groupIdSchema = z.uuid({ error: UUID_ERROR });

export const createStudentSchema = z.object({
  name: nameSchema,
  groupId: groupIdSchema,
});
export const updateStudentSchema = z.object({
  id: studentIdSchema,
  name: nameSchema,
  groupId: groupIdSchema,
});
export const deleteStudentSchema = z.object({ id: studentIdSchema });
