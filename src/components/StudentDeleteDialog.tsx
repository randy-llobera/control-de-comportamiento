"use client";

import { useState, useTransition } from "react";

import { deleteStudentAction } from "@/actions/students";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { StudentListItem } from "@/types/students";

type StudentDeleteDialogProps = {
  student: StudentListItem;
  onClose: () => void;
};

export function StudentDeleteDialog({
  student,
  onClose,
}: StudentDeleteDialogProps) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      onClose();
    }
  };

  const handleDelete = () => {
    setError(undefined);

    startTransition(async () => {
      const result = await deleteStudentAction({ id: student.id });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onClose();
    });
  };

  return (
    <AlertDialog open onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar estudiante</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar a {student.name}? Esta acción
            no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
