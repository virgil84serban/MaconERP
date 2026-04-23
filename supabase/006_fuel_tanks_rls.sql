create index if not exists fuel_tanks_org_current_level_idx
  on public.fuel_tanks (organization_id, current_level_liters);

create index if not exists fuel_tank_transactions_org_created_by_idx
  on public.fuel_tank_transactions (organization_id, created_by_user_profile_id, created_at desc);

alter table public.fuel_tanks enable row level security;
alter table public.fuel_tank_transactions enable row level security;

create policy fuel_tanks_select
on public.fuel_tanks
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or public.is_sofer()
  )
);

create policy fuel_tanks_insert
on public.fuel_tanks
for insert
with check (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
  )
);

create policy fuel_tanks_update
on public.fuel_tanks
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

create policy fuel_tank_transactions_select
on public.fuel_tank_transactions
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
  )
);

create policy fuel_tank_transactions_insert
on public.fuel_tank_transactions
for insert
with check (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or public.is_sofer()
  )
);

create policy fuel_tank_transactions_update
on public.fuel_tank_transactions
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

create policy fuel_tank_transactions_delete
on public.fuel_tank_transactions
for delete
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
  )
);
