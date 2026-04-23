create index if not exists vehicle_assignments_org_vehicle_rls_idx
  on public.vehicle_assignments (organization_id, vehicle_id, employee_id, status);

alter table public.vehicle_assignments enable row level security;

create policy vehicle_assignments_select
on public.vehicle_assignments
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or public.driver_can_access_employee(employee_id)
    or public.driver_can_access_vehicle(vehicle_id)
  )
);

create policy vehicle_assignments_insert
on public.vehicle_assignments
for insert
with check (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
  )
);

create policy vehicle_assignments_update
on public.vehicle_assignments
for update
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
  )
)
with check (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
  )
);

create policy vehicle_assignments_delete
on public.vehicle_assignments
for delete
using (
  organization_id = public.current_organization_id()
  and public.is_admin()
);
