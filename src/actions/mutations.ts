'use server';

import { getCurrentUserWithRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import type { Severity } from '@/types/database';

type ActionResult = { success: true } | { success: false; error: string };
type StudentInput = { name: string; groupId: string };
type IncidentInput = {
  studentId: string;
  categoryId: string;
  severity: Severity;
  description: string;
  date: string;
};

const unauthorized = (): ActionResult => ({
  success: false,
  error: 'No autorizado.',
});

const hasCoordinatorRole = (role: string | undefined) =>
  role === 'coordinator' || role === 'admin';

const runMutation = async (
  roles: 'authenticated' | 'coordinator' | 'admin',
  operation: (
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
  ) => PromiseLike<{ error: { message: string } | null }>,
): Promise<ActionResult> => {
  const auth = await getCurrentUserWithRole();
  const role = auth.profile?.roles?.name;
  if (
    !auth.profile ||
    (roles === 'coordinator' && !hasCoordinatorRole(role)) ||
    (roles === 'admin' && role !== 'admin')
  )
    return unauthorized();

  const { error } = await operation(await createClient(), auth.profile.id);
  return error ? { success: false, error: error.message } : { success: true };
};

export const createIncident = async (input: IncidentInput) =>
  await runMutation('authenticated', (supabase, userId) =>
    supabase.from('incidents').insert({
      student_id: input.studentId,
      category_id: input.categoryId,
      severity: input.severity,
      description: input.description,
      date: input.date,
      teacher_id: userId,
    }),
  );

export const saveStudent = async (id: string | null, input: StudentInput) =>
  await runMutation('authenticated', (supabase) =>
    id
      ? supabase
          .from('students')
          .update({ name: input.name, group_id: input.groupId })
          .eq('id', id)
      : supabase
          .from('students')
          .insert({ name: input.name, group_id: input.groupId }),
  );

export const deleteStudent = async (id: string) =>
  await runMutation('authenticated', (supabase) =>
    supabase.from('students').delete().eq('id', id),
  );

const saveNamedRecord = (
  table: 'groups' | 'categories',
  id: string | null,
  name: string,
) =>
  runMutation('coordinator', (supabase, userId) =>
    id
      ? supabase.from(table).update({ name }).eq('id', id)
      : supabase.from(table).insert({ name, created_by: userId }),
  );

const deleteNamedRecord = (table: 'groups' | 'categories', id: string) =>
  runMutation('coordinator', (supabase) =>
    supabase.from(table).delete().eq('id', id),
  );

export const saveGroup = async (id: string | null, name: string) =>
  await saveNamedRecord('groups', id, name);
export const deleteGroup = async (id: string) =>
  await deleteNamedRecord('groups', id);
export const saveCategory = async (id: string | null, name: string) =>
  await saveNamedRecord('categories', id, name);
export const deleteCategory = async (id: string) =>
  await deleteNamedRecord('categories', id);

export const updateUserRole = async (userId: string, roleId: string) =>
  await runMutation('admin', (supabase) =>
    supabase.from('users').update({ role_id: roleId }).eq('id', userId),
  );
