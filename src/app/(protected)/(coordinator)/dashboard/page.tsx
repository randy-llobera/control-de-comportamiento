"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { IncidentWithDetails } from "@/types/database";

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<IncidentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await supabase
          .from("incidents")
          .select(
            `
          *,
          students(name, groups(name)),
          categories(name)
        `,
          )
          .order("created_at", { ascending: false });

        setIncidents(data || []);
      } catch (error) {
        console.error("Error loading incidents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStats = () => {
    const total = incidents.length;
    const bySeverity = {
      low: incidents.filter((i) => i.severity === "low").length,
      medium: incidents.filter((i) => i.severity === "medium").length,
      high: incidents.filter((i) => i.severity === "high").length,
    };

    const byCategory: Record<string, number> = incidents.reduce(
      (acc, incident) => {
        const categoryName = incident.categories?.name || "Sin categoría";
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byGroup: Record<string, number> = incidents.reduce(
      (acc, incident) => {
        const groupName = incident.students?.groups?.name || "Sin grupo";
        acc[groupName] = (acc[groupName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const recentIncidents = incidents.slice(0, 10);

    return {
      total,
      bySeverity,
      byCategory,
      byGroup,
      recentIncidents,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Incidentes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">B</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Gravedad Baja
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.bySeverity.low}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">M</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Gravedad Media
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.bySeverity.medium}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Gravedad Alta
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.bySeverity.high}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incidents by Category */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Incidentes por Categoría
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.byCategory).map(([category, count]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">{category}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Incidents by Group */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Incidentes por Grupo
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.byGroup).map(([group, count]) => (
                    <div
                      key={group}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">{group}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Incidentes Recientes
              </h3>
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {stats.recentIncidents.map((incident) => (
                    <li key={incident.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {incident.students?.name} -{" "}
                            {incident.students?.groups?.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {incident.categories?.name} •{" "}
                            {incident.severity === "low"
                              ? "Baja"
                              : incident.severity === "medium"
                                ? "Media"
                                : "Alta"}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {incident.description}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(incident.date).toLocaleDateString("es-ES")}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {stats.recentIncidents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay incidentes recientes
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
