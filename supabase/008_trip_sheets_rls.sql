create index if not exists trip_sheets_org_vehicle_employee_rls_idx
  on public.trip_sheets (organization_id, vehicle_id, employee_id, departure_date desc);

alter table public.trip_sheets enable row level security;

create policy trip_sheets_select
on public.trip_sheets
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

create policy trip_sheets_insert
on public.trip_sheets
for insert
with check (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or (
      public.is_sofer()
      and public.driver_can_access_employee(employee_id)
      and public.driver_can_access_vehicle(vehicle_id)
    )
  )
);

create policy trip_sheets_update
on public.trip_sheets
for update
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or (
      public.is_sofer()
      and public.driver_can_access_employee(employee_id)
      and public.driver_can_access_vehicle(vehicle_id)
    )
  )
)
with check (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or (
      public.is_sofer()
      and public.driver_can_access_employee(employee_id)
      and public.driver_can_access_vehicle(vehicle_id)
    )
  )
);

create policy trip_sheets_delete
on public.trip_sheets
for delete
using (
  organization_id = public.current_organization_id()
  and public.is_admin()
);
