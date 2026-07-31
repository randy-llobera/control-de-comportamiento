"use client";

import { useState, useTransition } from "react";

import { deleteIncidentAction } from "@/actions/incidents";
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
import type { IncidentListItem } from "@/types/incidents";

type IncidentDeleteDialogProps = {
  incident: IncidentListItem;
  onClose: () => void;
};

export function IncidentDeleteDialog({
  incident,
  onClose,
}: IncidentDeleteDialogProps) {
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
      const result = await deleteIncidentAction({ id: incident.id });

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
          <AlertDialogTitle>Eliminar incidente</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar el incidente de{" "}
            {incident.student.name} del {incident.date}? Esta acción no se puede
            deshacer.
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
