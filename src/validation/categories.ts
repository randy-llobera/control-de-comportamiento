import { z } from "zod";

const REQUIRED_ERROR = "Este campo es obligatorio.";
const UUID_ERROR = "Selecciona una opción válida.";
const nameSchema = z
  .string({ error: REQUIRED_ERROR })
  .trim()
  .min(1, { error: REQUIRED_ERROR });
const categoryIdSchema = z.uuid({ error: UUID_ERROR });

export const createCategorySchema = z.object({ name: nameSchema });
export const updateCategorySchema = z.object({
  id: categoryIdSchema,
  name: nameSchema,
});
export const deleteCategorySchema = z.object({ id: categoryIdSchema });
