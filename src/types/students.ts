export type StudentGroupOption = {
  id: string;
  name: string;
};

export type StudentSummary = {
  id: string;
  name: string;
};

export type StudentListItem = StudentSummary & {
  group: StudentGroupOption;
};

export type StudentPageData = {
  students: StudentListItem[];
  groupOptions: StudentGroupOption[];
  canManageStudents: boolean;
};

export type CreateStudentInput = z.output<typeof createStudentSchema>;
export type UpdateStudentInput = z.output<typeof updateStudentSchema>;
import type { z } from "zod";

import type {
  createStudentSchema,
  updateStudentSchema,
} from "@/validation/students";
