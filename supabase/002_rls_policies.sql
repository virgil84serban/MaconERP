-- Helper indexes for RLS performance
create index if not exists user_profiles_auth_user_id_idx
  on public.user_profiles (auth_user_id);

create index if not exists user_roles_org_user_role_idx
  on public.user_roles (organization_id, user_profile_id, role_id, status);

create index if not exists employees_org_user_profile_idx
  on public.employees (organization_id, user_profile_id);

create index if not exists vehicles_org_current_employee_idx
  on public.vehicles (organization_id, current_employee_id);

create index if not exists fuel_logs_org_employee_idx
  on public.fuel_logs (organization_id, employee_id, operation_date);

create index if not exists maintenance_logs_org_employee_idx
  on public.maintenance_logs (organization_id, employee_id, maintenance_date);

create index if not exists vehicle_documents_org_vehicle_idx
  on public.vehicle_documents (organization_id, vehicle_id);

create index if not exists attachments_org_entity_type_id_idx
  on public.attachments (organization_id, entity_type, entity_id);

create index if not exists activity_logs_org_actor_idx
  on public.activity_logs (organization_id, actor_user_profile_id, created_at);


-- Helper functions
create or replace function public.current_user_profile_id()
returns uuid
language sql
stable
as $$
  select up.id
  from public.user_profiles up
  where up.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
as $$
  select up.organization_id
  from public.user_profiles up
  where up.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.has_role(role_code text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_profile_id = public.current_user_profile_id()
      and ur.organization_id = public.current_organization_id()
      and ur.status = 'active'
      and r.code = role_code
  )
$$;

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
as $$
  select target_org_id = public.current_organization_id()
$$;

create or replace function public.current_employee_id()
returns uuid
language sql
stable
as $$
  select e.id
  from public.employees e
  where e.user_profile_id = public.current_user_profile_id()
    and e.organization_id = public.current_organization_id()
  limit 1
$$;

create or replace function public.driver_can_access_vehicle(target_vehicle_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.vehicles v
    where v.id = target_vehicle_id
      and v.organization_id = public.current_organization_id()
      and v.current_employee_id = public.current_employee_id()
  )
$$;

create or replace function public.driver_can_access_employee(target_employee_id uuid)
returns boolean
language sql
stable
as $$
  select target_employee_id = public.current_employee_id()
$$;

create or replace function public.manager_santier_can_access_project(target_project_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.id = public.current_user_profile_id()
      and up.organization_id = public.current_organization_id()
      and (
        up.metadata ? 'allowed_project_ids'
        and up.metadata->'allowed_project_ids' @> to_jsonb(array[target_project_id]::uuid[])
      )
  )
$$;

create or replace function public.manager_santier_can_access_site(target_site_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.id = public.current_user_profile_id()
      and up.organization_id = public.current_organization_id()
      and (
        up.metadata ? 'allowed_site_ids'
        and up.metadata->'allowed_site_ids' @> to_jsonb(array[target_site_id]::uuid[])
      )
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.has_role('admin')
$$;

create or replace function public.is_manager_flota()
returns boolean
language sql
stable
as $$
  select public.has_role('manager_flota')
$$;

create or replace function public.is_manager_santier()
returns boolean
language sql
stable
as $$
  select public.has_role('manager_santier')
$$;

create or replace function public.is_contabilitate()
returns boolean
language sql
stable
as $$
  select public.has_role('contabilitate')
$$;

create or replace function public.is_sofer()
returns boolean
language sql
stable
as $$
  select public.has_role('sofer')
$$;


-- Enable RLS
alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.employees enable row level security;
alter table public.projects enable row level security;
alter table public.sites enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_documents enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.fuel_logs enable row level security;
alter table public.expenses enable row level security;
alter table public.attachments enable row level security;
alter table public.activity_logs enable row level security;


-- organizations
create policy organizations_select
on public.organizations
for select
using (id = public.current_organization_id());

create policy organizations_admin_update
on public.organizations
for update
using (id = public.current_organization_id() and public.is_admin())
with check (id = public.current_organization_id() and public.is_admin());


-- user_profiles
create policy user_profiles_select
on public.user_profiles
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or id = public.current_user_profile_id()
  )
);

create policy user_profiles_insert_admin
on public.user_profiles
for insert
with check (
  organization_id = public.current_organization_id()
  and public.is_admin()
);

create policy user_profiles_update_admin_or_self
on public.user_profiles
for update
using (
  organization_id = public.current_organization_id()
  and (public.is_admin() or id = public.current_user_profile_id())
)
with check (
  organization_id = public.current_organization_id()
  and (public.is_admin() or id = public.current_user_profile_id())
);


-- roles
create policy roles_select_org_member
on public.roles
for select
using (public.current_user_profile_id() is not null);


-- user_roles
create policy user_roles_select
on public.user_roles
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or user_profile_id = public.current_user_profile_id()
  )
);

create policy user_roles_manage_admin
on public.user_roles
for all
using (
  organization_id = public.current_organization_id()
  and public.is_admin()
)
with check (
  organization_id = public.current_organization_id()
  and public.is_admin()
);


-- employees
create policy employees_select
on public.employees
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or public.driver_can_access_employee(id)
  )
);

create policy employees_manage_fleet_admin
on public.employees
for all
using (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
)
with check (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
);


-- projects
create policy projects_select
on public.projects
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or public.is_manager_santier() and public.manager_santier_can_access_project(id)
  )
);

create policy projects_manage_admin
on public.projects
for all
using (
  organization_id = public.current_organization_id()
  and public.is_admin()
)
with check (
  organization_id = public.current_organization_id()
  and public.is_admin()
);


-- sites
create policy sites_select
on public.sites
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or public.is_manager_santier() and public.manager_santier_can_access_site(id)
  )
);

create policy sites_manage_admin_or_manager_santier
on public.sites
for all
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or (public.is_manager_santier() and public.manager_santier_can_access_site(id))
  )
)
with check (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or (public.is_manager_santier() and public.manager_santier_can_access_site(id))
  )
);


-- vehicles
create policy vehicles_select
on public.vehicles
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or public.driver_can_access_vehicle(id)
  )
);

create policy vehicles_manage_fleet_admin
on public.vehicles
for all
using (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
)
with check (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
);


-- vehicle_documents
create policy vehicle_documents_select
on public.vehicle_documents
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_documents.vehicle_id
        and public.driver_can_access_vehicle(v.id)
    )
  )
);

create policy vehicle_documents_manage_admin_manager_flota
on public.vehicle_documents
for all
using (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
)
with check (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
);


-- maintenance_logs
create policy maintenance_logs_select
on public.maintenance_logs
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or public.is_manager_santier() and (
      (site_id is not null and public.manager_santier_can_access_site(site_id))
      or (site_id is null and project_id is null)
    )
    or (vehicle_id is not null and public.driver_can_access_vehicle(vehicle_id))
    or (employee_id is not null and public.driver_can_access_employee(employee_id))
  )
);

create policy maintenance_logs_manage_admin_manager_flota
on public.maintenance_logs
for all
using (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
)
with check (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
);


-- fuel_logs
create policy fuel_logs_select
on public.fuel_logs
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or public.is_manager_santier() and (
      (site_id is not null and public.manager_santier_can_access_site(site_id))
      or (project_id is not null and public.manager_santier_can_access_project(project_id))
    )
    or (employee_id is not null and public.driver_can_access_employee(employee_id))
    or (vehicle_id is not null and public.driver_can_access_vehicle(vehicle_id))
  )
);

create policy fuel_logs_manage_admin_manager_flota
on public.fuel_logs
for all
using (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
)
with check (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_manager_flota())
);

create policy fuel_logs_insert_sofer
on public.fuel_logs
for insert
with check (
  organization_id = public.current_organization_id()
  and public.is_sofer()
  and (
    (employee_id is not null and public.driver_can_access_employee(employee_id))
    or (vehicle_id is not null and public.driver_can_access_vehicle(vehicle_id))
  )
);


-- expenses
create policy expenses_select
on public.expenses
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_contabilitate()
    or public.is_manager_flota()
    or public.is_manager_santier() and (
      (site_id is not null and public.manager_santier_can_access_site(site_id))
      or (project_id is not null and public.manager_santier_can_access_project(project_id))
    )
  )
);

create policy expenses_manage_admin_contabilitate
on public.expenses
for all
using (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_contabilitate())
)
with check (
  organization_id = public.current_organization_id()
  and (public.is_admin() or public.is_contabilitate())
);


-- attachments
create policy attachments_select
on public.attachments
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or uploaded_by_user_profile_id = public.current_user_profile_id()
  )
);

create policy attachments_insert_org_member
on public.attachments
for insert
with check (
  organization_id = public.current_organization_id()
  and public.current_user_profile_id() is not null
);

create policy attachments_update_admin_or_owner
on public.attachments
for update
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or uploaded_by_user_profile_id = public.current_user_profile_id()
  )
)
with check (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or uploaded_by_user_profile_id = public.current_user_profile_id()
  )
);

create policy attachments_delete_admin
on public.attachments
for delete
using (
  organization_id = public.current_organization_id()
  and public.is_admin()
);


-- activity_logs
create policy activity_logs_select
on public.activity_logs
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.is_admin()
    or public.is_manager_flota()
    or public.is_contabilitate()
    or actor_user_profile_id = public.current_user_profile_id()
  )
);

create policy activity_logs_insert_org_member
on public.activity_logs
for insert
with check (
  organization_id = public.current_organization_id()
  and public.current_user_profile_id() is not null
);

create policy activity_logs_delete_admin
on public.activity_logs
for delete
using (
  organization_id = public.current_organization_id()
  and public.is_admin()
);
