"use client";

import { useState, useTransition, type SubmitEventHandler } from "react";

import { createGroupAction, updateGroupAction } from "@/actions/groups";
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
import type { GroupListItem } from "@/types/groups";
import { createGroupSchema, updateGroupSchema } from "@/validation/groups";
import { fieldErrors } from "@/validation/form-errors";

type GroupFormDialogProps =
  | {
      mode: "create";
      onClose: () => void;
    }
  | {
      mode: "edit";
      group: GroupListItem;
      onClose: () => void;
    };

export function GroupFormDialog(props: GroupFormDialogProps) {
  const [name, setName] = useState(
    props.mode === "edit" ? props.group.name : "",
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

    const parsed = (
      isEditing ? updateGroupSchema : createGroupSchema
    ).safeParse(isEditing ? { id: props.group.id, name } : { name });
    if (!parsed.success) {
      setNameErrors(fieldErrors(parsed.error).name);
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateGroupAction({ id: props.group.id, name })
        : await createGroupAction({ name });

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
            {isEditing ? "Editar grupo" : "Nuevo grupo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Actualiza el nombre de ${props.group.name}.`
              : "Introduce el nombre del nuevo grupo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="group-name">Nombre del grupo</Label>
            <Input
              id="group-name"
              name="name"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(nameErrors?.length)}
              aria-describedby={
                nameErrors?.length ? "group-name-errors" : undefined
              }
              placeholder="Nombre del grupo"
            />
            {nameErrors?.length ? (
              <div id="group-name-errors" className="space-y-1">
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
