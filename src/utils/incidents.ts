import type {
  IncidentFilterCriteria,
  IncidentListItem,
  IncidentSeverity,
} from "@/types/incidents";
import { formatDisplayDate } from "@/utils/date";

const CSV_HEADERS = [
  "Fecha",
  "Estudiante",
  "Grupo",
  "Categoría",
  "Gravedad",
  "Descripción",
  "Profesor",
] as const;

const UTF8_BOM = "\uFEFF";

const SEVERITY_LABELS = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
} as const satisfies Record<IncidentSeverity, string>;

function escapeCsvField(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function filterIncidents(
  incidents: IncidentListItem[],
  filters: IncidentFilterCriteria,
): IncidentListItem[] {
  return incidents.filter(
    (incident) =>
      (!filters.category || incident.category.id === filters.category) &&
      (!filters.severity || incident.severity === filters.severity) &&
      (!filters.group || incident.student.group.id === filters.group) &&
      (!filters.dateFrom || incident.date >= filters.dateFrom) &&
      (!filters.dateTo || incident.date <= filters.dateTo),
  );
}

export function serializeIncidentsToCsv(incidents: IncidentListItem[]): string {
  const rows = incidents.map((incident) => [
    formatDisplayDate(incident.date),
    incident.student.name,
    incident.student.group.name,
    incident.category.name,
    SEVERITY_LABELS[incident.severity],
    incident.description,
    incident.teacher.displayName,
  ]);

  const content = [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\r\n");

  return `${UTF8_BOM}${content}`;
}

export function formatIncidentCsvFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `incidentes-${year}${month}${day}.csv`;
}
