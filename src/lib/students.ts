import type { QueryData } from '@supabase/supabase-js';

import { ApplicationError } from '@/lib/application-error';
import { requirePermission } from '@/lib/auth';
import { createClient, type ServerSupabaseClient } from '@/lib/supabase-server';
import type {
  CreateStudentInput,
  StudentPageData,
  StudentSummary,
  UpdateStudentInput,
} from '@/types/students';

const validateGroupExists = async (
  supabase: ServerSupabaseClient,
  groupId: string,
): Promise<void> => {
  const { data, error } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .maybeSingle();

  if (error) {
    console.error('Failed to validate the student group:', error.message);
    throw error;
  }
  if (!data) {
    throw new ApplicationError('not-found');
  }
};

const validateStudentAvailable = async (
  supabase: ServerSupabaseClient,
  input: CreateStudentInput,
  excludedStudentId?: string,
): Promise<void> => {
  let query = supabase
    .from('students')
    .select('id')
    .eq('name', input.name)
    .eq('group_id', input.groupId);

  if (excludedStudentId) {
    query = query.neq('id', excludedStudentId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Failed to validate the student name:', error.message);
    throw error;
  }
  if (data) {
    throw new ApplicationError('conflict');
  }
};

export const getStudentPageData = async (): Promise<StudentPageData> => {
  const supabase = await createClient();
  const actor = await requirePermission(supabase, 'students:read');

  const studentsQuery = supabase
    .from('students')
    .select('id, name, group_id, groups(name)')
    .order('name');
  const groupsQuery = supabase.from('groups').select('id, name').order('name');
  type StudentRows = QueryData<typeof studentsQuery>;
  type GroupRows = QueryData<typeof groupsQuery>;

  const [
    { data: studentData, error: studentsError },
    { data: groupData, error: groupsError },
  ] = await Promise.all([studentsQuery, groupsQuery]);

  if (studentsError) {
    console.error('Failed to load students:', studentsError.message);
    throw studentsError;
  }
  if (groupsError) {
    console.error('Failed to load student group options:', groupsError.message);
    throw groupsError;
  }

  const students: StudentRows = studentData ?? [];
  const groups: GroupRows = groupData ?? [];

  return {
    students: students.map((student) => ({
      id: student.id,
      name: student.name,
      group: {
        id: student.group_id,
        name: student.groups?.name ?? '',
      },
    })),
    groupOptions: groups.map((group) => ({
      id: group.id,
      name: group.name,
    })),
    canManageStudents: actor.role === 'admin',
  };
};

export const getGroupStudents = async (
  groupId: string,
): Promise<StudentSummary[]> => {
  const supabase = await createClient();
  await requirePermission(supabase, 'students:read');
  await validateGroupExists(supabase, groupId);

  const { data, error } = await supabase
    .from('students')
    .select('id, name')
    .eq('group_id', groupId)
    .order('name');

  if (error) {
    console.error(
      'Failed to load students for the selected group:',
      error.message,
    );
    throw error;
  }

  return data ?? [];
};

export const createStudent = async (
  input: CreateStudentInput,
): Promise<void> => {
  const supabase = await createClient();
  await requirePermission(supabase, 'students:create');
  await validateGroupExists(supabase, input.groupId);
  await validateStudentAvailable(supabase, input);

  const { error } = await supabase
    .from('students')
    .insert({ name: input.name, group_id: input.groupId });

  if (error) {
    console.error('Failed to create student:', error.message);
    throw error;
  }
};

export const updateStudent = async (
  input: UpdateStudentInput,
): Promise<void> => {
  const supabase = await createClient();
  await requirePermission(supabase, 'students:manage');
  await validateGroupExists(supabase, input.groupId);
  await validateStudentAvailable(supabase, input, input.id);

  const { data, error } = await supabase
    .from('students')
    .update({ name: input.name, group_id: input.groupId })
    .eq('id', input.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to update student:', error.message);
    throw error;
  }
  if (!data) {
    throw new ApplicationError('not-found');
  }
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  const supabase = await createClient();
  await requirePermission(supabase, 'students:manage');

  const { data: incidents, error: incidentsError } = await supabase
    .from('incidents')
    .select('id')
    .eq('student_id', studentId)
    .limit(1);

  if (incidentsError) {
    console.error(
      'Failed to validate student deletion:',
      incidentsError.message,
    );
    throw incidentsError;
  }
  if ((incidents?.length ?? 0) > 0) {
    throw new ApplicationError('conflict');
  }

  const { data, error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to delete student:', error.message);
    throw error;
  }
  if (!data) {
    throw new ApplicationError('not-found');
  }
};
