import type { QueryData } from "@supabase/supabase-js";

import { ApplicationError } from "@/lib/application-error";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type {
  CategoryListItem,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/categories";

export const getCategoryList = async (): Promise<CategoryListItem[]> => {
  const supabase = await createClient();
  await requirePermission(supabase, "categories:manage");

  const categoriesQuery = supabase
    .from("categories")
    .select("id, name, users(display_name)")
    .order("name");
  type CategoryRows = QueryData<typeof categoriesQuery>;

  const { data, error } = await categoriesQuery;

  if (error) {
    console.error("Failed to load categories:", error.message);
    throw error;
  }

  const categories: CategoryRows = data ?? [];

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    createdByDisplayName: category.users?.display_name ?? "",
  }));
};

export const createCategory = async (
  input: CreateCategoryInput,
): Promise<void> => {
  const supabase = await createClient();
  const actor = await requirePermission(supabase, "categories:manage");

  const { data: existingCategory, error: existingCategoryError } =
    await supabase
      .from("categories")
      .select("id")
      .eq("name", input.name)
      .maybeSingle();

  if (existingCategoryError) {
    console.error(
      "Failed to validate category name:",
      existingCategoryError.message,
    );
    throw existingCategoryError;
  }
  if (existingCategory) {
    throw new ApplicationError("conflict");
  }

  const { error } = await supabase
    .from("categories")
    .insert({ name: input.name, created_by: actor.id });

  if (error) {
    console.error("Failed to create category:", error.message);
    throw error;
  }
};

export const updateCategory = async (
  input: UpdateCategoryInput,
): Promise<void> => {
  const supabase = await createClient();
  await requirePermission(supabase, "categories:manage");

  const { data: existingCategory, error: existingCategoryError } =
    await supabase
      .from("categories")
      .select("id")
      .eq("name", input.name)
      .neq("id", input.id)
      .maybeSingle();

  if (existingCategoryError) {
    console.error(
      "Failed to validate category name:",
      existingCategoryError.message,
    );
    throw existingCategoryError;
  }
  if (existingCategory) {
    throw new ApplicationError("conflict");
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ name: input.name })
    .eq("id", input.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update category:", error.message);
    throw error;
  }
  if (!data) {
    throw new ApplicationError("not-found");
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const supabase = await createClient();
  await requirePermission(supabase, "categories:manage");

  const { data: incidents, error: incidentsError } = await supabase
    .from("incidents")
    .select("id")
    .eq("category_id", categoryId)
    .limit(1);

  if (incidentsError) {
    console.error(
      "Failed to validate category deletion:",
      incidentsError.message,
    );
    throw incidentsError;
  }
  if ((incidents?.length ?? 0) > 0) {
    throw new ApplicationError("conflict");
  }

  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete category:", error.message);
    throw error;
  }
  if (!data) {
    throw new ApplicationError("not-found");
  }
};
