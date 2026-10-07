export type CategoryListItem = {
  id: string;
  name: string;
  createdByDisplayName: string;
};

export type CreateCategoryInput = z.output<typeof createCategorySchema>;
export type UpdateCategoryInput = z.output<typeof updateCategorySchema>;
import type { z } from "zod";

import type {
  createCategorySchema,
  updateCategorySchema,
} from "@/validation/categories";
