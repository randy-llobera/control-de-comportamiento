-- Local-only fixtures. Run after db:bootstrap-admin; never apply to production.
with
  admin_user as (
    select u.id
    from public.users u
    join public.roles r on r.id = u.role_id
    where r.name = 'admin'
    limit 1
  ),
  seed_groups(name) as (
    values ('ESO 1A'), ('ESO 1B'), ('ESO 2A'), ('ESO 2B')
  ),
  inserted_groups as (
    insert into public.groups (name, created_by)
    select seed_groups.name, admin_user.id
    from seed_groups
    cross join admin_user
    on conflict (name) do nothing
    returning id, name
  ),
  seed_categories(name) as (
    values ('Indisciplina en Clase'), ('Asistencia'), ('Dispositivos Electronicos')
  ),
  inserted_categories as (
    insert into public.categories (name, created_by)
    select seed_categories.name, admin_user.id
    from seed_categories
    cross join admin_user
    on conflict (name) do nothing
    returning id
  ),
  available_groups as (
    select id, name from inserted_groups
    union all
    select id, name from public.groups
  ),
  seed_students(name, group_name) as (
    values ('Alice', 'ESO 1A'), ('Bob', 'ESO 1B'), ('Peter', 'ESO 2A')
  )
insert into public.students (name, group_id)
select seed_students.name, groups.id
from seed_students
join available_groups groups on groups.name = seed_students.group_name
on conflict (name, group_id) do nothing;
