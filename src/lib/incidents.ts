import type { QueryData } from '@supabase/supabase-js';

import { ApplicationError } from '@/lib/application-error';
import { requirePermission } from '@/lib/auth';
import { createClient, type ServerSupabaseClient } from '@/lib/supabase-server';
import type {
  CreateIncidentInput,
  IncidentPageData,
  IncidentSeverity,
} from '@/types/incidents';

const isIncidentSeverity = (value: string): value is IncidentSeverity =>
  value === 'low' || value === 'medium' || value === 'high';

const validateStudentExists = async (
  supabase: ServerSupabaseClient,
  studentId: string,
): Promise<void> => {
  const { data, error } = await supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .maybeSingle();

  if (error) {
    console.error('Failed to validate the incident student:', error.message);
    throw error;
  }
  if (!data) {
    throw new ApplicationError('not-found');
  }
};

const validateCategoryExists = async (
  supabase: ServerSupabaseClient,
  categoryId: string,
): Promise<void> => {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .maybeSingle();

  if (error) {
    console.error('Failed to validate the incident category:', error.message);
    throw error;
  }
  if (!data) {
    throw new ApplicationError('not-found');
  }
};

export const getIncidentPageData = async (): Promise<IncidentPageData> => {
  const supabase = await createClient();
  await requirePermission(supabase, 'incidents:read');

  const incidentsQuery = supabase
    .from('incidents')
    .select(
      'id, student_id, category_id, teacher_id, severity, description, date, students(name, group_id, groups(name)), categories(name), users(display_name)',
    )
    .order('created_at', { ascending: false });
  const studentsQuery = supabase
    .from('students')
    .select('id, name, group_id, groups(name)')
    .order('name');
  const categoriesQuery = supabase
    .from('categories')
    .select('id, name')
    .order('name');
  const groupsQuery = supabase.from('groups').select('id, name').order('name');
  type IncidentRows = QueryData<typeof incidentsQuery>;
  type StudentRows = QueryData<typeof studentsQuery>;
  type CategoryRows = QueryData<typeof categoriesQuery>;
  type GroupRows = QueryData<typeof groupsQuery>;

  const [
    { data: incidentData, error: incidentsError },
    { data: studentData, error: studentsError },
    { data: categoryData, error: categoriesError },
    { data: groupData, error: groupsError },
  ] = await Promise.all([
    incidentsQuery,
    studentsQuery,
    categoriesQuery,
    groupsQuery,
  ]);

  if (incidentsError) {
    console.error('Failed to load incidents:', incidentsError.message);
    throw incidentsError;
  }
  if (studentsError) {
    console.error(
      'Failed to load incident student options:',
      studentsError.message,
    );
    throw studentsError;
  }
  if (categoriesError) {
    console.error(
      'Failed to load incident category options:',
      categoriesError.message,
    );
    throw categoriesError;
  }
  if (groupsError) {
    console.error(
      'Failed to load incident group options:',
      groupsError.message,
    );
    throw groupsError;
  }

  const incidents: IncidentRows = incidentData ?? [];
  const students: StudentRows = studentData ?? [];
  const categories: CategoryRows = categoryData ?? [];
  const groups: GroupRows = groupData ?? [];

  return {
    incidents: incidents.map((incident) => {
      if (!isIncidentSeverity(incident.severity)) {
        throw new Error('Invalid incident severity.');
      }

      return {
        id: incident.id,
        date: incident.date,
        severity: incident.severity,
        description: incident.description,
        student: {
          id: incident.student_id,
          name: incident.students?.name ?? '',
          group: {
            id: incident.students?.group_id ?? '',
            name: incident.students?.groups?.name ?? '',
          },
        },
        category: {
          id: incident.category_id,
          name: incident.categories?.name ?? '',
        },
        teacher: {
          id: incident.teacher_id,
          displayName: incident.users?.display_name ?? '',
        },
      };
    }),
    formOptions: {
      students: students.map((student) => ({
        id: student.id,
        name: student.name,
        group: {
          id: student.group_id,
          name: student.groups?.name ?? '',
        },
      })),
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
      })),
    },
  };
};

export const createIncident = async (
  input: CreateIncidentInput,
): Promise<void> => {
  const supabase = await createClient();
  const actor = await requirePermission(supabase, 'incidents:create');

  await Promise.all([
    validateStudentExists(supabase, input.studentId),
    validateCategoryExists(supabase, input.categoryId),
  ]);

  const { error } = await supabase.from('incidents').insert({
    student_id: input.studentId,
    category_id: input.categoryId,
    severity: input.severity,
    description: input.description,
    date: input.date,
    teacher_id: actor.id,
  });

  if (error) {
    console.error('Failed to create incident:', error.message);
    throw error;
  }
};
