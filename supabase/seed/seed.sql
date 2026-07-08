begin;

-- NOTE: keep names consistently cased (or lowercased) to avoid duplicates by casing.
-- If you later want case-insensitive uniqueness, we can switch to citext or normalize inputs.

-- ---- ROLES (ensure canonical roles exist) ----
insert into public.roles (name)
values ('admin'), ('coordinator'), ('teacher')
on conflict (name) do nothing;

-- ---- GROUPS (parents) ----
insert into public.groups (name, created_by)
select g.name, u.id
from (values
  ('ESO1'),
  ('ESO2'),
  ('ESO3'),
  ('ESO4')
) as g(name)
-- resolve created_by to some existing user; fallback to the first admin if present
join public.users u
  on u.role_id = (select id from public.roles where name = 'admin' limit 1)
on conflict (name) do nothing;

-- If you don't have an admin user yet locally, the above JOIN will insert 0 rows.
-- That's fine for now; once you create a local admin in Studio, re-run the seed and groups will insert.

-- ---- CATEGORIES (parents) ----
insert into public.categories (name, created_by)
select c.name, u.id
from (values
  ('Behavior'),
  ('Attendance'),
  ('Achievement')
) as c(name)
join public.users u
  on u.role_id = (select id from public.roles where name = 'admin' limit 1)
on conflict (name) do nothing;

-- ---- STUDENTS (children) ----
-- Example of resolving FK by group name via CTE
with target_groups as (
  select id as group_id, name
  from public.groups
  where name in ('ESO1','ESO2')
)
insert into public.students (name, group_id)
select s.name, tg.group_id
from (values
  ('Alice', 'ESO1'),
  ('Bob',   'ESO1'),
  ('Chloe', 'ESO2')
) as s(name, group_name)
join target_groups tg on tg.name = s.group_name
on conflict (name, group_id) do nothing;

commit;