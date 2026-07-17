'use server';

import { loadCurrentUserWithRole } from '@/lib/auth';
import { createClient, type ServerSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';

export type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const UUID_ERROR = 'Selecciona una opción válida.';
const REQUIRED_ERROR = 'Este campo es obligatorio.';
const INVALID_DATE_ERROR = 'Introduce una fecha válida.';

const uuidSchema = z.string({ error: UUID_ERROR }).uuid({ error: UUID_ERROR });
const nameSchema = z.string({ error: REQUIRED_ERROR }).trim().min(1, { error: REQUIRED_ERROR });
const dateSchema = z
  .string({ error: INVALID_DATE_ERROR })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: INVALID_DATE_ERROR })
  .refine(
    (value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    },
    { error: INVALID_DATE_ERROR },
  );

const incidentSchema = z.object({
  studentId: uuidSchema,
  categoryId: uuidSchema,
  severity: z.enum(['low', 'medium', 'high'], { error: 'Selecciona una gravedad válida.' }),
  description: z.string({ error: REQUIRED_ERROR }).trim().min(1, { error: REQUIRED_ERROR }),
  date: dateSchema,
});
const studentSchema = z.object({
  id: uuidSchema.nullable(),
  name: nameSchema,
  groupId: uuidSchema,
});
const namedRecordSchema = z.object({ id: uuidSchema.nullable(), name: nameSchema });
const userRoleSchema = z.object({ userId: uuidSchema, roleId: uuidSchema });

type MutationOperationResult = {
  error: { message: string } | null;
  fieldErrors?: Record<string, string[]>;
};

const validationFailed = (error: z.ZodError): ActionResult => ({
  success: false,
  error: 'Revisa los campos marcados.',
  fieldErrors: error.issues.reduce<Record<string, string[]>>((fieldErrors, issue) => {
    const field = issue.path.join('.');
    if (field) fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
    return fieldErrors;
  }, {}),
});

const unauthorized = (): ActionResult => ({
  success: false,
  error: 'No autorizado.',
});

const hasCoordinatorRole = (role: string | undefined) =>
  role === 'coordinator' || role === 'admin';

const runMutation = async (
  roles: 'authenticated' | 'coordinator' | 'admin',
  operation: (
    supabase: ServerSupabaseClient,
    userId: string,
  ) => PromiseLike<MutationOperationResult>,
): Promise<ActionResult> => {
  const supabase = await createClient();
  const auth = await loadCurrentUserWithRole(supabase);
  const role = auth.profile?.roles?.name;
  if (
    !auth.profile ||
    (roles === 'coordinator' && !hasCoordinatorRole(role)) ||
    (roles === 'admin' && role !== 'admin')
  )
    return unauthorized();

  const { error, fieldErrors } = await operation(supabase, auth.profile.id);
  if (fieldErrors)
    return { success: false, error: 'Revisa los campos marcados.', fieldErrors };

  if (error) {
    console.error('Server Action mutation failed:', error.message);
    return { success: false, error: 'No se pudo guardar el cambio. Inténtalo de nuevo.' };
  }

  return { success: true };
};

export const createIncident = async (input: unknown): Promise<ActionResult> => {
  const parsed = incidentSchema.safeParse(input);
  if (!parsed.success) return validationFailed(parsed.error);

  return runMutation('authenticated', (supabase, userId) =>
    supabase.from('incidents').insert({
      student_id: parsed.data.studentId,
      category_id: parsed.data.categoryId,
      severity: parsed.data.severity,
      description: parsed.data.description,
      date: parsed.data.date,
      teacher_id: userId,
    }),
  );
};

export const saveStudent = async (id: unknown, input: unknown): Promise<ActionResult> => {
  const parsed = studentSchema.safeParse(
    typeof input === 'object' && input !== null ? { id, ...input } : { id, input },
  );
  if (!parsed.success) return validationFailed(parsed.error);

  return runMutation('authenticated', (supabase) =>
    parsed.data.id
      ? supabase
          .from('students')
          .update({ name: parsed.data.name, group_id: parsed.data.groupId })
          .eq('id', parsed.data.id)
      : supabase
          .from('students')
          .insert({ name: parsed.data.name, group_id: parsed.data.groupId }),
  );
};

const deleteRecord = async (
  table: 'students' | 'groups' | 'categories',
  id: unknown,
  roles: 'authenticated' | 'coordinator',
): Promise<ActionResult> => {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return validationFailed(parsed.error);

  return runMutation(roles, (supabase) => supabase.from(table).delete().eq('id', parsed.data));
};

export const deleteStudent = async (id: unknown) =>
  await deleteRecord('students', id, 'authenticated');

const saveNamedRecord = async (
  table: 'groups' | 'categories',
  id: unknown,
  name: unknown,
): Promise<ActionResult> => {
  const parsed = namedRecordSchema.safeParse({ id, name });
  if (!parsed.success) return validationFailed(parsed.error);

  return runMutation('coordinator', (supabase, userId) =>
    parsed.data.id
      ? supabase.from(table).update({ name: parsed.data.name }).eq('id', parsed.data.id)
      : supabase.from(table).insert({ name: parsed.data.name, created_by: userId }),
  );
};

export const saveGroup = async (id: unknown, name: unknown) =>
  await saveNamedRecord('groups', id, name);
export const deleteGroup = async (id: unknown) =>
  await deleteRecord('groups', id, 'coordinator');
export const saveCategory = async (id: unknown, name: unknown) =>
  await saveNamedRecord('categories', id, name);
export const deleteCategory = async (id: unknown) =>
  await deleteRecord('categories', id, 'coordinator');

export const updateUserRole = async (userId: unknown, roleId: unknown): Promise<ActionResult> => {
  const parsed = userRoleSchema.safeParse({ userId, roleId });
  if (!parsed.success) return validationFailed(parsed.error);

  return runMutation('admin', async (supabase) => {
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('id', parsed.data.roleId)
      .maybeSingle();
    if (roleError) return { error: roleError };
    if (!role)
      return { error: null, fieldErrors: { roleId: ['El rol seleccionado no es válido.'] } };

    return supabase.from('users').update({ role_id: parsed.data.roleId }).eq('id', parsed.data.userId);
  });
};
