"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { createIncident } from "@/actions/mutations";
import { IncidentWithDetails, Student, Group, Category } from "@/types/database";

export default function IncidentesPage() {
  const [incidents, setIncidents] = useState<IncidentWithDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [filters, setFilters] = useState({
    category: "",
    severity: "",
    group: "",
    dateFrom: "",
    dateTo: "",
  });

  // Form state for new incident
  const [formData, setFormData] = useState({
    student_id: "",
    category_id: "",
    severity: "low" as "low" | "medium" | "high",
    description: "",
    date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [incidentsRes, studentsRes, groupsRes, categoriesRes] =
        await Promise.all([
          supabase
            .from("incidents")
            .select(
              `
          *,
          students(name),
          categories(name),
          users(display_name)
        `,
            )
            .order("created_at", { ascending: false }),
          supabase.from("students").select("*"),
          supabase.from("groups").select("*"),
          supabase.from("categories").select("*"),
        ]);

      setIncidents(incidentsRes.data || []);
      setStudents(studentsRes.data || []);
      setGroups(groupsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createIncident({
        studentId: formData.student_id,
        categoryId: formData.category_id,
        severity: formData.severity,
        description: formData.description,
        date: formData.date,
      });
      if (!result.success) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setShowForm(false);
      setFormError("");
      setFieldErrors({});
      setFormData({
        student_id: "",
        category_id: "",
        severity: "low",
        description: "",
        date: "",
      });
      loadData();
    } catch (error) {
      console.error("Error creating incident:", error);
    }
  };

  const exportCSV = () => {
    const filteredIncidents = incidents.filter((incident) => {
      const student = students.find((s) => s.id === incident.student_id);
      const group = groups.find((g) => g.id === student?.group_id);
      const category = categories.find((c) => c.id === incident.category_id);

      return (
        (!filters.category || category?.id === filters.category) &&
        (!filters.severity || incident.severity === filters.severity) &&
        (!filters.group || group?.id === filters.group) &&
        (!filters.dateFrom || incident.date >= filters.dateFrom) &&
        (!filters.dateTo || incident.date <= filters.dateTo)
      );
    });

    const csvContent = [
      [
        "Fecha",
        "Estudiante",
        "Grupo",
        "Categoría",
        "Gravedad",
        "Descripción",
        "Profesor",
      ],
      ...filteredIncidents.map((incident) => {
        const student = students.find((s) => s.id === incident.student_id);
        const group = groups.find((g) => g.id === student?.group_id);
        const category = categories.find((c) => c.id === incident.category_id);
        return [
          incident.date,
          student?.name || "",
          group?.name || "",
          category?.name || "",
          incident.severity,
          incident.description,
          "",
        ];
      }),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `incidentes-${new Date().toISOString().split("T")[0].replace(/-/g, "")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredIncidents = () => {
    return incidents.filter((incident) => {
      const student = students.find((s) => s.id === incident.student_id);
      const group = groups.find((g) => g.id === student?.group_id);
      const category = categories.find((c) => c.id === incident.category_id);

      return (
        (!filters.category || category?.id === filters.category) &&
        (!filters.severity || incident.severity === filters.severity) &&
        (!filters.group || group?.id === filters.group) &&
        (!filters.dateFrom || incident.date >= filters.dateFrom) &&
        (!filters.dateTo || incident.date <= filters.dateTo)
      );
    });
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
            <h1 className="text-3xl font-bold text-gray-900">Incidentes</h1>
            <div className="space-x-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Nuevo Incidente
              </button>
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gravedad
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) =>
                    setFilters({ ...filters, severity: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Grupo
                </label>
                <select
                  value={filters.group}
                  onChange={(e) =>
                    setFilters({ ...filters, group: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* New Incident Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium mb-4">Nuevo Incidente</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && <p className="text-sm text-red-600">{formError}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estudiante
                    </label>
                    <select
                      required
                      value={formData.student_id}
                      onChange={(e) =>
                        setFormData({ ...formData, student_id: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar estudiante</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.studentId?.map((error) => (
                      <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Categoría
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.categoryId?.map((error) => (
                      <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gravedad
                    </label>
                    <select
                      required
                      value={formData.severity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          severity: e.target.value as "low" | "medium" | "high",
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                    {fieldErrors.severity?.map((error) => (
                      <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    {fieldErrors.date?.map((error) => (
                      <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe el incidente..."
                  />
                  {fieldErrors.description?.map((error) => (
                    <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
                  ))}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Crear Incidente
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Incidents List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {getFilteredIncidents().map((incident) => {
                const student = students.find(
                  (s) => s.id === incident.student_id,
                );
                const group = groups.find((g) => g.id === student?.group_id);
                const category = categories.find(
                  (c) => c.id === incident.category_id,
                );
                return (
                  <li key={incident.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {student?.name} - {group?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {incident.date}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {category?.name} •{" "}
                          {incident.severity === "low"
                            ? "Baja"
                            : incident.severity === "medium"
                              ? "Media"
                              : "Alta"}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {incident.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Registrado por: {incident.users?.display_name}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {getFilteredIncidents().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron incidentes con los filtros aplicados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
