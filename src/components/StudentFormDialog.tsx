"use client";

import { useState, useTransition, type SubmitEventHandler } from "react";

import { createStudentAction, updateStudentAction } from "@/actions/students";
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
import type { StudentGroupOption, StudentListItem } from "@/types/students";

type StudentFormDialogProps =
  | {
      mode: "create";
      groupOptions: StudentGroupOption[];
      onClose: () => void;
    }
  | {
      mode: "edit";
      student: StudentListItem;
      groupOptions: StudentGroupOption[];
      onClose: () => void;
    };

export function StudentFormDialog(props: StudentFormDialogProps) {
  const [name, setName] = useState(
    props.mode === "edit" ? props.student.name : "",
  );
  const [groupId, setGroupId] = useState(
    props.mode === "edit" ? props.student.group.id : "",
  );
  const [error, setError] = useState<string>();
  const [nameErrors, setNameErrors] = useState<string[]>();
  const [groupErrors, setGroupErrors] = useState<string[]>();
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
    setGroupErrors(undefined);

    startTransition(async () => {
      const result = isEditing
        ? await updateStudentAction({
            id: props.student.id,
            name,
            groupId,
          })
        : await createStudentAction({ name, groupId });

      if (!result.success) {
        setError(result.error);
        setNameErrors(result.fieldErrors?.name);
        setGroupErrors(result.fieldErrors?.groupId);
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
            {isEditing ? "Editar estudiante" : "Nuevo estudiante"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Actualiza los datos de ${props.student.name}.`
              : "Introduce el nombre y el grupo del nuevo estudiante."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="student-name">Nombre del estudiante</Label>
            <Input
              id="student-name"
              name="name"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(nameErrors?.length)}
              aria-describedby={
                nameErrors?.length ? "student-name-errors" : undefined
              }
              placeholder="Nombre del estudiante"
            />
            {nameErrors?.length ? (
              <div id="student-name-errors" className="space-y-1">
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

          <div className="space-y-2">
            <Label htmlFor="student-group">Grupo</Label>
            <select
              id="student-group"
              name="groupId"
              required
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(groupErrors?.length)}
              aria-describedby={
                groupErrors?.length ? "student-group-errors" : undefined
              }
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar grupo</option>
              {props.groupOptions.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {groupErrors?.length ? (
              <div id="student-group-errors" className="space-y-1">
                {groupErrors.map((groupError) => (
                  <p
                    key={groupError}
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {groupError}
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
