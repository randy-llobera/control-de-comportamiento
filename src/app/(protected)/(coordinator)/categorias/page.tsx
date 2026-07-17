"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { deleteCategory, saveCategory } from "@/actions/mutations";
import { Category, CategoryWithUser } from "@/types/database";

export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoryWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [deleteError, setDeleteError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data } = await supabase
        .from("categories")
        .select(
          `
          *,
          users(display_name)
        `,
        )
        .order("name");

      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await saveCategory(editingCategory?.id ?? null, formData.name);
      if (!result.success) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setShowForm(false);
      setFormError("");
      setFieldErrors({});
      setEditingCategory(null);
      setFormData({ name: "" });
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?"))
      return;

    try {
      const result = await deleteCategory(id);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }

      setDeleteError("");
      loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      setDeleteError("No se pudo eliminar la categoría. Inténtalo de nuevo.");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: "" });
    setFormError("");
    setFieldErrors({});
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
            <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Nueva Categoría
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium mb-4">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && <p className="text-sm text-red-600">{formError}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre de la categoría"
                  />
                  {fieldErrors.name?.map((error) => (
                    <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
                  ))}
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
                    {editingCategory ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {deleteError && <p role="alert" className="px-6 pt-4 text-sm text-red-600">{deleteError}</p>}
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li key={category.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {category.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Creado por: {category.users?.display_name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {categories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay categorías registradas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
