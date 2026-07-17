"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { deleteGroup, saveGroup } from "@/actions/mutations";
import { Group, GroupWithUser } from "@/types/database";

export default function GruposPage() {
  const [groups, setGroups] = useState<GroupWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data } = await supabase
        .from("groups")
        .select(
          `
          *,
          users(display_name)
        `,
        )
        .order("name");

      setGroups(data || []);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await saveGroup(editingGroup?.id ?? null, formData.name);
      if (!result.success) throw new Error(result.error);

      setShowForm(false);
      setEditingGroup(null);
      setFormData({ name: "" });
      loadData();
    } catch (error) {
      console.error("Error saving group:", error);
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este grupo?")) return;

    try {
      const result = await deleteGroup(id);
      if (!result.success) throw new Error(result.error);
      loadData();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingGroup(null);
    setFormData({ name: "" });
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Grupos</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Nuevo Grupo
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium mb-4">
                {editingGroup ? "Editar Grupo" : "Nuevo Grupo"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Grupo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del grupo"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingGroup ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Groups List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {groups.map((group) => (
                <li key={group.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {group.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Creado por: {group.users?.display_name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(group)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {groups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay grupos registrados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
