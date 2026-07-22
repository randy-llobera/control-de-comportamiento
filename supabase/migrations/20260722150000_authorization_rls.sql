begin;

drop policy "Authenticated users can manage students"
on public.students;

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

drop policy "Authenticated users can update incidents"
on public.incidents;

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

drop policy "Authenticated users can delete incidents"
on public.incidents;

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

commit;
