import type { z } from "zod";

import type {
  createIncidentSchema,
  updateIncidentSchema,
} from "@/validation/incidents";

export const INCIDENT_SEVERITIES = ["low", "medium", "high"] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export type IncidentGroupOption = {
  id: string;
  name: string;
};

export type IncidentStudentOption = {
  id: string;
  name: string;
  group: IncidentGroupOption;
};

export type IncidentCategoryOption = {
  id: string;
  name: string;
};

export type IncidentListItem = {
  id: string;
  date: string;
  severity: IncidentSeverity;
  description: string;
  canManage: boolean;
  student: IncidentStudentOption;
  category: IncidentCategoryOption;
  teacher: {
    id: string;
    displayName: string;
  };
};

export type IncidentFormOptions = {
  categories: IncidentCategoryOption[];
  groups: IncidentGroupOption[];
};

export type IncidentPageData = {
  incidents: IncidentListItem[];
  formOptions: IncidentFormOptions;
};

export type IncidentFilterCriteria = {
  category: string;
  severity: IncidentSeverity | "";
  group: string;
  dateFrom: string;
  dateTo: string;
};

export type CreateIncidentInput = z.output<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.output<typeof updateIncidentSchema>;
