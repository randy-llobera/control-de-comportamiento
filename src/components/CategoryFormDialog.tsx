"use client";

import { useState, useTransition, type SubmitEventHandler } from "react";

import {
  createCategoryAction,
  updateCategoryAction,
} from "@/actions/categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryListItem } from "@/types/categories";

type CategoryFormDialogProps =
  | {
      mode: "create";
      onClose: () => void;
    }
  | {
      mode: "edit";
      category: CategoryListItem;
      onClose: () => void;
    };

export function CategoryFormDialog(props: CategoryFormDialogProps) {
  const [name, setName] = useState(
    props.mode === "edit" ? props.category.name : "",
  );
  const [error, setError] = useState<string>();
  const [nameErrors, setNameErrors] = useState<string[]>();
  const [isPending, startTransition] = useTransition();
  const isEditing = props.mode === "edit";

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      props.onClose();
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setError(undefined);
    setNameErrors(undefined);

    startTransition(async () => {
      const result = isEditing
        ? await updateCategoryAction({ id: props.category.id, name })
        : await createCategoryAction({ name });

      if (!result.success) {
        setError(result.error);
        setNameErrors(result.fieldErrors?.name);
        return;
      }

      props.onClose();
    });
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Actualiza el nombre de ${props.category.name}.`
              : "Introduce el nombre de la nueva categoría."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre de la categoría</Label>
            <Input
              id="category-name"
              name="name"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(nameErrors?.length)}
              aria-describedby={
                nameErrors?.length ? "category-name-errors" : undefined
              }
              placeholder="Nombre de la categoría"
            />
            {nameErrors?.length ? (
              <div id="category-name-errors" className="space-y-1">
                {nameErrors.map((nameError) => (
                  <p
                    key={nameError}
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {nameError}
                  </p>
                ))}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={props.onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
