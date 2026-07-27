"use client";

import { useState } from "react";

import { StudentDeleteDialog } from "@/components/StudentDeleteDialog";
import { StudentFormDialog } from "@/components/StudentFormDialog";
import { Button } from "@/components/ui/button";
import type { StudentListItem, StudentPageData } from "@/types/students";

type StudentsViewProps = StudentPageData;

type ActiveDialog =
  | { type: "create" }
  | { type: "edit"; student: StudentListItem }
  | { type: "delete"; student: StudentListItem };

export function StudentsView({
  students,
  groupOptions,
  canManageStudents,
}: StudentsViewProps) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>();

  const closeDialog = () => {
    setActiveDialog(undefined);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
        <Button
          onClick={() => setActiveDialog({ type: "create" })}
          disabled={groupOptions.length === 0}
        >
          Nuevo estudiante
        </Button>
      </div>

      {groupOptions.length === 0 && (
        <p role="status" className="mb-4 text-sm text-gray-600">
          Debe existir al menos un grupo para crear estudiantes.
        </p>
      )}

      <div className="overflow-hidden rounded-md bg-white shadow">
        <ul className="divide-y divide-gray-200">
          {students.map((student) => (
            <li key={student.id} className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {student.name}
                  </p>
                  <p className="truncate text-sm text-gray-600">
                    {student.group.name}
                  </p>
                </div>

                {canManageStudents && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveDialog({ type: "edit", student })}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setActiveDialog({ type: "delete", student })
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {students.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No hay estudiantes registrados
          </div>
        )}
      </div>

      {activeDialog?.type === "create" && (
        <StudentFormDialog
          mode="create"
          groupOptions={groupOptions}
          onClose={closeDialog}
        />
      )}

      {activeDialog?.type === "edit" && canManageStudents && (
        <StudentFormDialog
          key={activeDialog.student.id}
          mode="edit"
          student={activeDialog.student}
          groupOptions={groupOptions}
          onClose={closeDialog}
        />
      )}

      {activeDialog?.type === "delete" && canManageStudents && (
        <StudentDeleteDialog
          student={activeDialog.student}
          onClose={closeDialog}
        />
      )}
    </>
  );
}
