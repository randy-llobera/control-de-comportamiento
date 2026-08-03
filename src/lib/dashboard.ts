import type { QueryData } from "@supabase/supabase-js";

import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type { DashboardPageData, DashboardSummary } from "@/types/dashboard";
import type { IncidentSeverity } from "@/types/incidents";

const RECENT_INCIDENT_LIMIT = 10;

const isIncidentSeverity = (value: string): value is IncidentSeverity =>
  value === "low" || value === "medium" || value === "high";

export const getDashboardPageData = async (): Promise<DashboardPageData> => {
  const supabase = await createClient();
  await requirePermission(supabase, "dashboard:read");

  const incidentsQuery = supabase
    .from("incidents")
    .select(
      "id, created_at, date, severity, description, students(name, groups(name)), categories(name)",
    )
    .order("created_at", { ascending: false });
  type IncidentRows = QueryData<typeof incidentsQuery>;

  const { data, error } = await incidentsQuery;

  if (error) {
    console.error("Failed to load dashboard incidents:", error.message);
    throw error;
  }

  const incidents: IncidentRows = data ?? [];
  const mappedIncidents = incidents.map((incident) => {
    if (!isIncidentSeverity(incident.severity)) {
      throw new Error("Invalid incident severity.");
    }

    return {
      id: incident.id,
      createdAt: incident.created_at,
      date: incident.date,
      severity: incident.severity,
      description: incident.description,
      studentName: incident.students?.name ?? null,
      categoryName: incident.categories?.name ?? null,
      groupName: incident.students?.groups?.name ?? null,
    };
  });

  const summary: DashboardSummary = {
    total: mappedIncidents.length,
    bySeverity: { low: 0, medium: 0, high: 0 },
    byCategory: {},
    byGroup: {},
  };

  mappedIncidents.forEach((incident) => {
    const categoryName = incident.categoryName ?? "Sin categoría";
    const groupName = incident.groupName ?? "Sin grupo";

    summary.bySeverity[incident.severity] += 1;
    summary.byCategory[categoryName] =
      (summary.byCategory[categoryName] ?? 0) + 1;
    summary.byGroup[groupName] = (summary.byGroup[groupName] ?? 0) + 1;
  });

  const recentIncidents = [...mappedIncidents]
    .sort((left, right) => {
      if (left.createdAt === right.createdAt) return 0;
      if (left.createdAt === null) return 1;
      if (right.createdAt === null) return -1;
      return right.createdAt.localeCompare(left.createdAt);
    })
    .slice(0, RECENT_INCIDENT_LIMIT)
    .map((incident) => ({
      id: incident.id,
      date: incident.date,
      severity: incident.severity,
      description: incident.description,
      studentName: incident.studentName ?? "",
      categoryName: incident.categoryName ?? "",
      groupName: incident.groupName ?? "",
    }));

  return { summary, recentIncidents };
};
