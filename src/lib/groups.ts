import type { QueryData } from '@supabase/supabase-js';

import { ApplicationError } from '@/lib/application-error';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import type {
  CreateGroupInput,
  GroupListItem,
  UpdateGroupInput,
} from '@/types/groups';

export const getGroupList = async (): Promise<GroupListItem[]> => {
  const supabase = await createClient();
  await requirePermission(supabase, 'groups:manage');

  const groupsQuery = supabase
    .from('groups')
    .select('id, name, users(display_name)')
    .order('name');
  type GroupRows = QueryData<typeof groupsQuery>;

  const { data, error } = await groupsQuery;

  if (error) {
    console.error('Failed to load groups:', error.message);
    throw error;
  }

  const groups: GroupRows = data ?? [];

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    createdByDisplayName: group.users?.display_name ?? '',
  }));
};

export const createGroup = async (input: CreateGroupInput): Promise<void> => {
  const supabase = await createClient();
  const actor = await requirePermission(supabase, 'groups:manage');

  const { data: existingGroup, error: existingGroupError } = await supabase
    .from('groups')
    .select('id')
    .eq('name', input.name)
    .maybeSingle();

  if (existingGroupError) {
    console.error('Failed to validate group name:', existingGroupError.message);
    throw existingGroupError;
  }
  if (existingGroup) {
    throw new ApplicationError('conflict');
  }

  const { error } = await supabase
    .from('groups')
    .insert({ name: input.name, created_by: actor.id });

  if (error) {
    console.error('Failed to create group:', error.message);
    throw error;
  }
};

export const updateGroup = async (input: UpdateGroupInput): Promise<void> => {
  const supabase = await createClient();
  await requirePermission(supabase, 'groups:manage');

  const { data: existingGroup, error: existingGroupError } = await supabase
    .from('groups')
    .select('id')
    .eq('name', input.name)
    .neq('id', input.id)
    .maybeSingle();

  if (existingGroupError) {
    console.error('Failed to validate group name:', existingGroupError.message);
    throw existingGroupError;
  }
  if (existingGroup) {
    throw new ApplicationError('conflict');
  }

  const { data, error } = await supabase
    .from('groups')
    .update({ name: input.name })
    .eq('id', input.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to update group:', error.message);
    throw error;
  }
  if (!data) {
    throw new ApplicationError('not-found');
  }
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  const supabase = await createClient();
  await requirePermission(supabase, 'groups:manage');

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id')
    .eq('group_id', groupId)
    .limit(1);

  if (studentsError) {
    console.error('Failed to validate group deletion:', studentsError.message);
    throw studentsError;
  }
  if ((students?.length ?? 0) > 0) {
    throw new ApplicationError('conflict');
  }

  const { data, error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to delete group:', error.message);
    throw error;
  }
  if (!data) {
    throw new ApplicationError('not-found');
  }
};
