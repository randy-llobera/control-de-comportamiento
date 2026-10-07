import { z } from "zod";

const REQUIRED_ERROR = "Este campo es obligatorio.";
const UUID_ERROR = "Selecciona una opción válida.";
const nameSchema = z
  .string({ error: REQUIRED_ERROR })
  .trim()
  .min(1, { error: REQUIRED_ERROR });
const groupIdSchema = z.uuid({ error: UUID_ERROR });

export const createGroupSchema = z.object({ name: nameSchema });
export const updateGroupSchema = z.object({
  id: groupIdSchema,
  name: nameSchema,
});
export const deleteGroupSchema = z.object({ id: groupIdSchema });
