"use client";

import { useState } from "react";

import { GroupDeleteDialog } from "@/components/GroupDeleteDialog";
import { GroupFormDialog } from "@/components/GroupFormDialog";
import { Button } from "@/components/ui/button";
import type { GroupListItem } from "@/types/groups";

type GroupsViewProps = {
  groups: GroupListItem[];
};

type ActiveDialog =
  | { type: "create" }
  | { type: "edit"; group: GroupListItem }
  | { type: "delete"; group: GroupListItem };

export function GroupsView({ groups }: GroupsViewProps) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>();

  const closeDialog = () => {
    setActiveDialog(undefined);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-app-text">Grupos</h1>
        <Button onClick={() => setActiveDialog({ type: "create" })}>
          Nuevo grupo
        </Button>
      </div>

      <div className="overflow-hidden rounded-md bg-surface shadow">
        <ul className="divide-y divide-app-border">
          {groups.map((group) => (
            <li key={group.id} className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-app-text">
                    {group.name}
                  </p>
                  <p className="truncate text-sm text-app-text-subtle">
                    Creado por: {group.createdByDisplayName}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveDialog({ type: "edit", group })}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setActiveDialog({ type: "delete", group })}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {groups.length === 0 && (
          <div className="py-8 text-center text-app-text-muted">
            No hay grupos registrados
          </div>
        )}
      </div>

      {activeDialog?.type === "create" && (
        <GroupFormDialog mode="create" onClose={closeDialog} />
      )}

      {activeDialog?.type === "edit" && (
        <GroupFormDialog
          key={activeDialog.group.id}
          mode="edit"
          group={activeDialog.group}
          onClose={closeDialog}
        />
      )}

      {activeDialog?.type === "delete" && (
        <GroupDeleteDialog group={activeDialog.group} onClose={closeDialog} />
      )}
    </>
  );
}
