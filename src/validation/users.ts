import { z } from "zod";

const UUID_ERROR = "Selecciona una opción válida.";
const uuidSchema = z.uuid({ error: UUID_ERROR });

export const updateUserRoleSchema = z.object({
  userId: uuidSchema,
  roleId: uuidSchema,
});
