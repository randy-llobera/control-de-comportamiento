"use client";

import { useState, useTransition } from "react";

import { updateUserRoleAction } from "@/actions/users";
import type { RoleOption } from "@/types/users";

const ROLE_LABELS = {
  admin: "Administrador",
  coordinator: "Coordinador",
  teacher: "Profesor",
} as const;

interface UserRoleControlsProps {
  userId: string;
  currentRole: RoleOption;
  roles: RoleOption[];
}

export function UserRoleControls({
  userId,
  currentRole,
  roles,
}: UserRoleControlsProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(currentRole.id);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (roleId: string) => {
    setError(undefined);

    startTransition(async () => {
      const result = await updateUserRoleAction({ userId, roleId });

      if (!result.success) {
        setError(result.fieldErrors?.roleId?.[0] ?? result.error);
        return;
      }

      setSelectedRoleId(roleId);
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-app-text-muted">
        Rol actual: {ROLE_LABELS[currentRole.name]}
      </div>
      <select
        aria-label="Cambiar rol"
        value={selectedRoleId}
        disabled={isPending}
        onChange={(event) => handleRoleChange(event.target.value)}
        className="rounded-md border-gray-300 text-sm shadow-sm focus:border-ring focus:ring-ring/50 disabled:cursor-wait disabled:opacity-60"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {ROLE_LABELS[role.name]}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-danger-text">{error}</p>}
    </div>
  );
}
