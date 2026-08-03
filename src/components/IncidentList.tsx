import { Button } from "@/components/ui/button";
import type { IncidentListItem, IncidentSeverity } from "@/types/incidents";
import { formatDisplayDate } from "@/utils/date";

type IncidentListProps = {
  incidents: IncidentListItem[];
  onEdit: (incident: IncidentListItem) => void;
  onDelete: (incident: IncidentListItem) => void;
};

const SEVERITY_LABELS = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
} as const satisfies Record<IncidentSeverity, string>;

export function IncidentList({
  incidents,
  onEdit,
  onDelete,
}: IncidentListProps) {
  return (
    <div className="overflow-hidden rounded-md bg-white shadow">
      <ul className="divide-y divide-gray-200">
        {incidents.map((incident) => (
          <li key={incident.id} className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-gray-900">
                    {incident.student.name} - {incident.student.group.name}
                  </p>
                  <p className="shrink-0 text-sm text-gray-500">
                    {formatDisplayDate(incident.date)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {incident.category.name} •{" "}
                  {SEVERITY_LABELS[incident.severity]}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {incident.description}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Registrado por: {incident.teacher.displayName}
                </p>
              </div>

              {incident.canManage && (
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(incident)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(incident)}
                  >
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {incidents.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No se encontraron incidentes con los filtros aplicados
        </div>
      )}
    </div>
  );
}
