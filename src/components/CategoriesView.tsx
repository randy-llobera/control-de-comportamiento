"use client";

import { useState } from "react";

import { CategoryDeleteDialog } from "@/components/CategoryDeleteDialog";
import { CategoryFormDialog } from "@/components/CategoryFormDialog";
import { Button } from "@/components/ui/button";
import type { CategoryListItem } from "@/types/categories";

type CategoriesViewProps = {
  categories: CategoryListItem[];
};

type ActiveDialog =
  | { type: "create" }
  | { type: "edit"; category: CategoryListItem }
  | { type: "delete"; category: CategoryListItem };

export function CategoriesView({ categories }: CategoriesViewProps) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>();

  const closeDialog = () => {
    setActiveDialog(undefined);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-app-text">Categorías</h1>
        <Button onClick={() => setActiveDialog({ type: "create" })}>
          Nueva categoría
        </Button>
      </div>

      <div className="overflow-hidden rounded-md bg-surface shadow">
        <ul className="divide-y divide-app-border">
          {categories.map((category) => (
            <li key={category.id} className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-app-text">
                    {category.name}
                  </p>
                  <p className="truncate text-sm text-app-text-subtle">
                    Creado por: {category.createdByDisplayName}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveDialog({ type: "edit", category })}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setActiveDialog({ type: "delete", category })
                    }
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {categories.length === 0 && (
          <div className="py-8 text-center text-app-text-muted">
            No hay categorías registradas
          </div>
        )}
      </div>

      {activeDialog?.type === "create" && (
        <CategoryFormDialog mode="create" onClose={closeDialog} />
      )}

      {activeDialog?.type === "edit" && (
        <CategoryFormDialog
          key={activeDialog.category.id}
          mode="edit"
          category={activeDialog.category}
          onClose={closeDialog}
        />
      )}

      {activeDialog?.type === "delete" && (
        <CategoryDeleteDialog
          category={activeDialog.category}
          onClose={closeDialog}
        />
      )}
    </>
  );
}
