"use client";

import { useState, useTransition, type SubmitEventHandler } from "react";

import {
  createIncidentAction,
  updateIncidentAction,
} from "@/actions/incidents";
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
import { useGroupStudents } from "@/hooks/useGroupStudents";
import type {
  IncidentCategoryOption,
  IncidentGroupOption,
  IncidentListItem,
  IncidentSeverity,
} from "@/types/incidents";

type IncidentFormDialogProps =
  | {
      mode: "create";
      groups: IncidentGroupOption[];
      categories: IncidentCategoryOption[];
      onClose: () => void;
    }
  | {
      mode: "edit";
      incident: IncidentListItem;
      categories: IncidentCategoryOption[];
      onClose: () => void;
    };

const selectClassName =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";

type FieldErrorMessagesProps = {
  id: string;
  errors?: string[];
};

function FieldErrorMessages({ id, errors }: FieldErrorMessagesProps) {
  if (!errors?.length) {
    return null;
  }

  return (
    <div id={id} className="space-y-1">
      {errors.map((fieldError, index) => (
        <p
          key={`${fieldError}-${index}`}
          role="alert"
          className="text-sm text-destructive"
        >
          {fieldError}
        </p>
      ))}
    </div>
  );
}

export function IncidentFormDialog(props: IncidentFormDialogProps) {
  const isEditing = props.mode === "edit";
  const [groupId, setGroupId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [categoryId, setCategoryId] = useState(
    isEditing ? props.incident.category.id : "",
  );
  const [severity, setSeverity] = useState<IncidentSeverity>(
    isEditing ? props.incident.severity : "low",
  );
  const [description, setDescription] = useState(
    isEditing ? props.incident.description : "",
  );
  const [date, setDate] = useState(isEditing ? props.incident.date : "");
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [isPending, startTransition] = useTransition();
  const {
    students,
    isLoading: isLoadingStudents,
    error: studentLoadError,
  } = useGroupStudents(groupId);

  const handleGroupChange = (selectedGroupId: string) => {
    setGroupId(selectedGroupId);
    setStudentId("");
    setFieldErrors((current) => ({
      ...current,
      groupId: undefined,
      studentId: undefined,
    }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      props.onClose();
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setError(undefined);
    setFieldErrors({});

    if (!isEditing && !groupId) {
      setFieldErrors({ groupId: ["Selecciona un grupo."] });
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateIncidentAction({
            id: props.incident.id,
            categoryId,
            severity,
            description,
            date,
          })
        : await createIncidentAction({
            studentId,
            categoryId,
            severity,
            description,
            date,
          });

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      props.onClose();
    });
  };

  const studentPlaceholder = isLoadingStudents
    ? "Cargando estudiantes..."
    : studentLoadError
      ? "No se pudieron cargar"
      : students.length === 0 && groupId
        ? "No hay estudiantes en este grupo"
        : "Seleccionar estudiante";

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar incidente" : "Nuevo incidente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Actualiza el incidente de ${props.incident.student.name}. El estudiante no se puede cambiar.`
              : "Selecciona primero el grupo y después el estudiante."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="incident-student">Estudiante</Label>
              <Input
                id="incident-student"
                value={`${props.incident.student.name} - ${props.incident.student.group.name}`}
                readOnly
                disabled
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="incident-group">Grupo</Label>
                <select
                  id="incident-group"
                  required
                  autoFocus
                  value={groupId}
                  onChange={(event) => handleGroupChange(event.target.value)}
                  disabled={isPending}
                  aria-invalid={Boolean(fieldErrors.groupId?.length)}
                  aria-describedby={
                    fieldErrors.groupId?.length
                      ? "incident-group-errors"
                      : undefined
                  }
                  className={selectClassName}
                >
                  <option value="">Seleccionar grupo</option>
                  {props.groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <FieldErrorMessages
                  id="incident-group-errors"
                  errors={fieldErrors.groupId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident-student">Estudiante</Label>
                <select
                  id="incident-student"
                  required
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  disabled={
                    !groupId ||
                    isLoadingStudents ||
                    Boolean(studentLoadError) ||
                    students.length === 0 ||
                    isPending
                  }
                  aria-invalid={Boolean(fieldErrors.studentId?.length)}
                  aria-describedby={
                    fieldErrors.studentId?.length
                      ? "incident-student-errors"
                      : undefined
                  }
                  className={selectClassName}
                >
                  <option value="">{studentPlaceholder}</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
                <FieldErrorMessages
                  id="incident-student-errors"
                  errors={fieldErrors.studentId}
                />
                {studentLoadError && (
                  <p role="alert" className="text-sm text-destructive">
                    {studentLoadError}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="incident-category">Categoría</Label>
              <select
                id="incident-category"
                required
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.categoryId?.length)}
                aria-describedby={
                  fieldErrors.categoryId?.length
                    ? "incident-category-errors"
                    : undefined
                }
                className={selectClassName}
              >
                <option value="">Seleccionar categoría</option>
                {props.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldErrorMessages
                id="incident-category-errors"
                errors={fieldErrors.categoryId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-severity">Gravedad</Label>
              <select
                id="incident-severity"
                required
                value={severity}
                onChange={(event) =>
                  setSeverity(event.target.value as IncidentSeverity)
                }
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.severity?.length)}
                aria-describedby={
                  fieldErrors.severity?.length
                    ? "incident-severity-errors"
                    : undefined
                }
                className={selectClassName}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
              <FieldErrorMessages
                id="incident-severity-errors"
                errors={fieldErrors.severity}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incident-date">Fecha</Label>
            <Input
              id="incident-date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.date?.length)}
              aria-describedby={
                fieldErrors.date?.length ? "incident-date-errors" : undefined
              }
            />
            <FieldErrorMessages
              id="incident-date-errors"
              errors={fieldErrors.date}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incident-description">Descripción</Label>
            <textarea
              id="incident-description"
              required
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.description?.length)}
              aria-describedby={
                fieldErrors.description?.length
                  ? "incident-description-errors"
                  : undefined
              }
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe el incidente..."
            />
            <FieldErrorMessages
              id="incident-description-errors"
              errors={fieldErrors.description}
            />
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
            <Button
              type="submit"
              disabled={
                isPending || isLoadingStudents || (!isEditing && !studentId)
              }
            >
              {isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
