export type IncidentSeverity = 'low' | 'medium' | 'high';

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
  student: IncidentStudentOption;
  category: IncidentCategoryOption;
  teacher: {
    id: string;
    displayName: string;
  };
};

export type IncidentFormOptions = {
  students: IncidentStudentOption[];
  categories: IncidentCategoryOption[];
  groups: IncidentGroupOption[];
};

export type IncidentPageData = {
  incidents: IncidentListItem[];
  formOptions: IncidentFormOptions;
};

export type CreateIncidentInput = {
  studentId: string;
  categoryId: string;
  severity: IncidentSeverity;
  description: string;
  date: string;
};
