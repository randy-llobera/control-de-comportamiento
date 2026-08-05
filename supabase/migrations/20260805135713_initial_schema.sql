begin;

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('admin', 'coordinator', 'teacher')),
  created_at timestamp with time zone default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  display_name text not null,
  school_role text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid not null references public.users(id),
  created_at timestamp with time zone default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid not null references public.users(id),
  created_at timestamp with time zone default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_id uuid not null references public.groups(id),
  created_at timestamp with time zone default now(),
  unique (name, group_id)
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  category_id uuid not null references public.categories(id),
  severity text not null check (severity in ('low', 'medium', 'high')),
  description text not null,
  date date not null,
  teacher_id uuid not null references public.users(id),
  created_at timestamp with time zone default now()
);

alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.groups enable row level security;
alter table public.categories enable row level security;
alter table public.students enable row level security;
alter table public.incidents enable row level security;

insert into public.roles (name)
values ('admin'), ('coordinator'), ('teacher');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  teacher_role_id uuid;
begin
  select id into teacher_role_id
  from public.roles
  where name = 'teacher';

  insert into public.users (id, role_id, display_name, school_role)
  values (
    new.id,
    teacher_role_id,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'school_role'
  );

  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.id = auth.uid()
      and r.name = 'admin'
  );
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create policy "Authenticated users can view roles"
on public.roles
for select
to authenticated
using (true);

create policy "Coordinators and admins can manage categories"
on public.categories
for all
to authenticated
using (
  exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role_id in (
        select id from public.roles where name in ('coordinator', 'admin')
      )
  )
)
with check (
  exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role_id in (
        select id from public.roles where name in ('coordinator', 'admin')
      )
  )
);

create policy "Authenticated users can view categories"
on public.categories
for select
to authenticated
using (true);

create policy "Coordinators and admins can manage groups"
on public.groups
for all
to authenticated
using (
  exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role_id in (
        select id from public.roles where name in ('coordinator', 'admin')
      )
  )
)
with check (
  exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role_id in (
        select id from public.roles where name in ('coordinator', 'admin')
      )
  )
);

create policy "Authenticated users can view groups"
on public.groups
for select
to authenticated
using (true);

create policy "Authenticated users can view incidents"
on public.incidents
for select
to authenticated
using (true);

create policy "Authenticated users can create own incidents"
on public.incidents
for insert
to authenticated
with check (teacher_id = auth.uid());

create policy "Owners coordinators and admins can update incidents"
on public.incidents
for update
to authenticated
using (
  teacher_id = auth.uid()
  or exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role_id in (
        select id from public.roles where name in ('coordinator', 'admin')
      )
  )
)
with check (
  teacher_id = auth.uid()
  or exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role_id in (
        select id from public.roles where name in ('coordinator', 'admin')
      )
  )
);

create policy "Owners coordinators and admins can delete incidents"
on public.incidents
for delete
to authenticated
using (
  teacher_id = auth.uid()
  or exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role_id in (
        select id from public.roles where name in ('coordinator', 'admin')
      )
  )
);

create policy "Authenticated users can view students"
on public.students
for select
to authenticated
using (true);

create policy "Authenticated users can create students"
on public.students
for insert
to authenticated
with check (true);

create policy "Admins can update students"
on public.students
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete students"
on public.students
for delete
to authenticated
using (public.is_admin());

create policy "Admins can delete users"
on public.users
for delete
to authenticated
using (public.is_admin());

create policy "Admins can insert users"
on public.users
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update users"
on public.users
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated users can view user profiles"
on public.users
for select
to authenticated
using (true);

revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;

grant select on table
  public.categories,
  public.groups,
  public.incidents,
  public.roles,
  public.students,
  public.users
to authenticated;

grant insert, update, delete on table
  public.categories,
  public.groups,
  public.incidents,
  public.students,
  public.users
to authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

commit;
