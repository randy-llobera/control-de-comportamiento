import type { IncidentSeverity } from "@/types/incidents";

export type DashboardSummary = {
  total: number;
  bySeverity: Record<IncidentSeverity, number>;
  byCategory: Record<string, number>;
  byGroup: Record<string, number>;
};

export type RecentIncident = {
  id: string;
  date: string;
  severity: IncidentSeverity;
  description: string;
  studentName: string;
  categoryName: string;
  groupName: string;
};

export type DashboardPageData = {
  summary: DashboardSummary;
  recentIncidents: RecentIncident[];
};
