"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateUserRole } from "@/actions/mutations";
import { Role, UserWithRole } from "@/types/database";

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  async function loadData() {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        supabase
          .from("users")
          .select(
            `
            *,
            roles(name)
          `,
          )
          .order("created_at", { ascending: false }),
        supabase.from("roles").select("*").order("name"),
      ]);

      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      const result = await updateUserRole(userId, newRoleId);
      if (!result.success) throw new Error(result.error);
      loadData();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const getRoleName = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return "Administrador";
      case "coordinator":
        return "Coordinador";
      case "teacher":
        return "Profesor";
      default:
        return roleName;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Gestión de Usuarios
          </h1>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.display_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.display_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.school_role}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        Rol actual: {getRoleName(user.roles?.name || "")}
                      </div>
                      <select
                        value={user.role_id}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {getRoleName(role.name)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay usuarios registrados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
