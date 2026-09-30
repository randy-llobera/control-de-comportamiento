-- Initial 2026-27 student and category load
--
-- Run this entire script in the production SQL editor as a sufficiently
-- privileged database role. Before running it, replace NULL in
-- `load_actor_id` with the UUID of the existing admin or coordinator whose
-- account should be recorded as the creator of the eight groups and nine
-- categories.
--
-- The script is idempotent: group names use the groups.name unique constraint
-- and students use the students.(name, group_id) unique constraint. Existing
-- records are preserved; only missing groups, students, and categories from
-- this source data are inserted.

begin;

create temporary table initial_student_load (
  group_name text not null,
  name text not null,
  primary key (group_name, name)
) on commit drop;

create temporary table initial_category_load (
  name text primary key
) on commit drop;

insert into initial_student_load (group_name, name)
values
  -- Add here the list of student names
    ('STUDENT_GROUP', 'STUDENT_NAME'),

insert into initial_category_load (name)
values
  ('Retraso'),
  ('Salida no autorizada'),
  ('Conducta disruptiva'),
  ('Incumplimiento de las indicaciones del profesorado'),
  ('Falta de respeto o lenguaje inadecuado'),
  ('Conflicto entre estudiantes'),
  ('Uso inadecuado del móvil o de dispositivos'),
  ('Uso indebido o daño del material y las instalaciones'),
  ('Conducta contraria a las normas de convivencia');

do $$
declare
  -- Replace NULL with the UUID of an existing admin or coordinator in public.users.
  load_actor_id uuid := null;
  expected_group_count constant integer := 8;
  expected_student_count constant integer := 158;
  expected_category_count constant integer := 9;
  source_group_count integer;
  source_student_count integer;
  source_category_count integer;
  stored_student_count integer;
  stored_category_count integer;
begin
  if load_actor_id is null then
    raise exception 'Set load_actor_id to an existing admin or coordinator UUID before running this script.';
  end if;

  if not exists (
    select 1
    from public.users users
    join public.roles roles on roles.id = users.role_id
    where users.id = load_actor_id
      and roles.name in ('admin', 'coordinator')
  ) then
    raise exception 'load_actor_id must identify an existing admin or coordinator.';
  end if;

  select count(distinct group_name), count(*)
  into source_group_count, source_student_count
  from initial_student_load;

  if source_group_count <> expected_group_count then
    raise exception 'Expected % groups in the source roster, found %.', expected_group_count, source_group_count;
  end if;

  if source_student_count <> expected_student_count then
    raise exception 'Expected % students in the source roster, found %.', expected_student_count, source_student_count;
  end if;

  select count(*)
  into source_category_count
  from initial_category_load;

  if source_category_count <> expected_category_count then
    raise exception 'Expected % categories in the source list, found %.', expected_category_count, source_category_count;
  end if;

  insert into public.groups (name, created_by)
  select distinct initial_student_load.group_name, load_actor_id
  from initial_student_load
  on conflict (name) do nothing;

  insert into public.students (name, group_id)
  select initial_student_load.name, groups.id
  from initial_student_load
  join public.groups groups on groups.name = initial_student_load.group_name
  on conflict (name, group_id) do nothing;

  insert into public.categories (name, created_by)
  select initial_category_load.name, load_actor_id
  from initial_category_load
  on conflict (name) do nothing;

  select count(*)
  into stored_student_count
  from initial_student_load
  join public.groups groups on groups.name = initial_student_load.group_name
  join public.students students
    on students.group_id = groups.id
   and students.name = initial_student_load.name;

  if stored_student_count <> expected_student_count then
    raise exception 'Expected % stored source students after loading, found %.', expected_student_count, stored_student_count;
  end if;

  select count(*)
  into stored_category_count
  from initial_category_load
  join public.categories categories on categories.name = initial_category_load.name;

  if stored_category_count <> expected_category_count then
    raise exception 'Expected % stored source categories after loading, found %.', expected_category_count, stored_category_count;
  end if;
end $$;

select
  initial_student_load.group_name,
  count(*) as source_students,
  count(students.id) as stored_source_students,
  case
    when count(*) = count(students.id) then 'verified'
    else 'mismatch'
  end as verification
from initial_student_load
join public.groups groups on groups.name = initial_student_load.group_name
left join public.students students
  on students.group_id = groups.id
 and students.name = initial_student_load.name
group by initial_student_load.group_name
order by initial_student_load.group_name;

select
  initial_category_load.name as category_name,
  case
    when categories.id is not null then 'verified'
    else 'mismatch'
  end as verification
from initial_category_load
left join public.categories categories on categories.name = initial_category_load.name
order by initial_category_load.name;

commit;
