"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { deleteStudent, saveStudent } from "@/actions/mutations";
import { Student, Group } from "@/types/database";

export default function EstudiantesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    group_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [studentsRes, groupsRes] = await Promise.all([
        supabase
          .from("students")
          .select(
            `
          *,
          groups(name)
        `,
          )
          .order("name"),
        supabase.from("groups").select("*").order("name"),
      ]);

      setStudents(studentsRes.data || []);
      setGroups(groupsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await saveStudent(editingStudent?.id ?? null, {
        name: formData.name,
        groupId: formData.group_id,
      });
      if (!result.success) throw new Error(result.error);

      setShowForm(false);
      setEditingStudent(null);
      setFormData({ name: "", group_id: "" });
      loadData();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      group_id: student.group_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este estudiante?"))
      return;

    try {
      const result = await deleteStudent(id);
      if (!result.success) throw new Error(result.error);
      loadData();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingStudent(null);
    setFormData({ name: "", group_id: "" });
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
            <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Nuevo Estudiante
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium mb-4">
                {editingStudent ? "Editar Estudiante" : "Nuevo Estudiante"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del estudiante"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Grupo
                    </label>
                    <select
                      required
                      value={formData.group_id}
                      onChange={(e) =>
                        setFormData({ ...formData, group_id: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar grupo</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    {editingStudent ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Students List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {students.map((student) => {
                const group = groups.find((g) => g.id === student.group_id);
                return (
                  <li key={student.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-600">{group?.name}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {students.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay estudiantes registrados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
