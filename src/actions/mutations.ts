'use server';

import { loadCurrentUserWithRole } from '@/lib/auth';
import { createClient, type ServerSupabaseClient } from '@/lib/supabase-server';
import type { ActionResult } from '@/types/actions';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
type MutationOperationResult = {
  error: { message: string } | null;
  fieldErrors?: Record<string, string[]>;
};

type MutationName =
  | 'createIncident'
  | 'saveStudent'
  | 'deleteStudent'
  | 'saveGroup'
  | 'deleteGroup'
  | 'saveCategory'
  | 'deleteCategory';

const MUTATION_PATHS = {
  createIncident: ['/incidentes', '/dashboard'],
  saveStudent: ['/estudiantes', '/incidentes', '/dashboard'],
  deleteStudent: ['/estudiantes', '/incidentes', '/dashboard'],
  saveGroup: ['/grupos', '/estudiantes', '/incidentes', '/dashboard'],
  deleteGroup: ['/grupos', '/estudiantes', '/incidentes', '/dashboard'],
  saveCategory: ['/categorias', '/incidentes', '/dashboard'],
  deleteCategory: ['/categorias', '/incidentes', '/dashboard'],
} as const satisfies Record<MutationName, readonly string[]>;

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
  mutation: MutationName,
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

  MUTATION_PATHS[mutation].forEach((path) => revalidatePath(path));

  return { success: true, data: undefined };
};

export const createIncident = async (input: unknown): Promise<ActionResult> => {
  const parsed = incidentSchema.safeParse(input);
  if (!parsed.success) return validationFailed(parsed.error);

  return runMutation('authenticated', 'createIncident', (supabase, userId) =>
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

  return runMutation('authenticated', 'saveStudent', (supabase) =>
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
  mutation: 'deleteStudent' | 'deleteGroup' | 'deleteCategory',
): Promise<ActionResult> => {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return validationFailed(parsed.error);

  return runMutation(roles, mutation, (supabase) =>
    supabase.from(table).delete().eq('id', parsed.data),
  );
};

export const deleteStudent = async (id: unknown) =>
  await deleteRecord('students', id, 'authenticated', 'deleteStudent');

const saveNamedRecord = async (
  table: 'groups' | 'categories',
  id: unknown,
  name: unknown,
  mutation: 'saveGroup' | 'saveCategory',
): Promise<ActionResult> => {
  const parsed = namedRecordSchema.safeParse({ id, name });
  if (!parsed.success) return validationFailed(parsed.error);

  return runMutation('coordinator', mutation, (supabase, userId) =>
    parsed.data.id
      ? supabase.from(table).update({ name: parsed.data.name }).eq('id', parsed.data.id)
      : supabase.from(table).insert({ name: parsed.data.name, created_by: userId }),
  );
};

export const saveGroup = async (id: unknown, name: unknown) =>
  await saveNamedRecord('groups', id, name, 'saveGroup');
export const deleteGroup = async (id: unknown) =>
  await deleteRecord('groups', id, 'coordinator', 'deleteGroup');
export const saveCategory = async (id: unknown, name: unknown) =>
  await saveNamedRecord('categories', id, name, 'saveCategory');
export const deleteCategory = async (id: unknown) =>
  await deleteRecord('categories', id, 'coordinator', 'deleteCategory');
