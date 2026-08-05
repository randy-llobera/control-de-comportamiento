import { getDashboardPageData } from "@/lib/dashboard";
import { formatDisplayDate } from "@/utils/date";

export default async function DashboardPage() {
  const { summary, recentIncidents } = await getDashboardPageData();

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-app-text mb-6">Dashboard</h1>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-highlight rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-app-text-muted truncate">
                        Total Incidentes
                      </dt>
                      <dd className="text-lg font-medium text-app-text">
                        {summary.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-success rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">B</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-app-text-muted truncate">
                        Gravedad Baja
                      </dt>
                      <dd className="text-lg font-medium text-app-text">
                        {summary.bySeverity.low}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">M</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-app-text-muted truncate">
                        Gravedad Media
                      </dt>
                      <dd className="text-lg font-medium text-app-text">
                        {summary.bySeverity.medium}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-danger rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-app-text-muted truncate">
                        Gravedad Alta
                      </dt>
                      <dd className="text-lg font-medium text-app-text">
                        {summary.bySeverity.high}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incidents by Category */}
            <div className="bg-surface shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-app-text mb-4">
                  Incidentes por Categoría
                </h3>
                <div className="space-y-3">
                  {Object.entries(summary.byCategory).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-app-text-subtle">
                          {category}
                        </span>
                        <span className="text-sm font-medium text-app-text">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Incidents by Group */}
            <div className="bg-surface shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-app-text mb-4">
                  Incidentes por Grupo
                </h3>
                <div className="space-y-3">
                  {Object.entries(summary.byGroup).map(([group, count]) => (
                    <div
                      key={group}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-app-text-subtle">{group}</span>
                      <span className="text-sm font-medium text-app-text">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="mt-6 bg-surface shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-app-text mb-4">
                Incidentes Recientes
              </h3>
              <div className="overflow-hidden">
                <ul className="divide-y divide-app-border">
                  {recentIncidents.map((incident) => (
                    <li key={incident.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-app-text">
                            {incident.studentName} - {incident.groupName}
                          </p>
                          <p className="text-sm text-app-text-subtle mt-1">
                            {incident.categoryName} •{" "}
                            {incident.severity === "low"
                              ? "Baja"
                              : incident.severity === "medium"
                                ? "Media"
                                : "Alta"}
                          </p>
                          <p className="text-sm text-app-text-secondary mt-1">
                            {incident.description}
                          </p>
                        </div>
                        <div className="text-sm text-app-text-muted">
                          {formatDisplayDate(incident.date)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {recentIncidents.length === 0 && (
                  <div className="text-center py-8 text-app-text-muted">
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
