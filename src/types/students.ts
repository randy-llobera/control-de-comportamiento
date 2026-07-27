export type StudentGroupOption = {
  id: string;
  name: string;
};

export type StudentListItem = {
  id: string;
  name: string;
  group: StudentGroupOption;
};

export type StudentPageData = {
  students: StudentListItem[];
  groupOptions: StudentGroupOption[];
  canManageStudents: boolean;
};

export type CreateStudentInput = {
  name: string;
  groupId: string;
};

export type UpdateStudentInput = {
  id: string;
  name: string;
  groupId: string;
};
