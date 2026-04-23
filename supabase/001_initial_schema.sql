create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  slug text unique,
  status text not null default 'active',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();


create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  email text not null,
  full_name text not null,
  phone text,
  status text not null default 'active',
  avatar_url text,
  metadata jsonb not null default '{}'::jsonb,
  legacy_user_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index user_profiles_org_email_idx
  on public.user_profiles (organization_id, lower(email));

create index user_profiles_org_status_idx
  on public.user_profiles (organization_id, status);

create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();


create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_roles_updated_at
before update on public.roles
for each row execute function public.set_updated_at();


create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  is_primary boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_profile_id, role_id)
);

create unique index user_roles_primary_idx
  on public.user_roles (organization_id, user_profile_id)
  where is_primary = true;

create index user_roles_org_role_idx
  on public.user_roles (organization_id, role_id, status);

create trigger trg_user_roles_updated_at
before update on public.user_roles
for each row execute function public.set_updated_at();


create table public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  employee_code text,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'active',
  employment_type text,
  job_title text,
  license_categories text,
  hire_date date,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  legacy_sofer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, employee_code)
);

create index employees_org_user_idx
  on public.employees (organization_id, user_profile_id);

create index employees_org_status_idx
  on public.employees (organization_id, status);

create trigger trg_employees_updated_at
before update on public.employees
for each row execute function public.set_updated_at();


create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text,
  name text not null,
  client_name text,
  status text not null default 'active',
  start_date date,
  end_date date,
  budget numeric(14,2),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create index projects_org_status_idx
  on public.projects (organization_id, status);

create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();


create table public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  code text,
  name text not null,
  address text,
  city text,
  county text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  status text not null default 'active',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create index sites_project_idx
  on public.sites (project_id);

create index sites_org_status_idx
  on public.sites (organization_id, status);

create trigger trg_sites_updated_at
before update on public.sites
for each row execute function public.set_updated_at();


create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_code text,
  plate_number text not null,
  brand text,
  model text,
  fabrication_year integer,
  vehicle_type text,
  fuel_type text,
  status text not null default 'active',
  current_km numeric(12,2) not null default 0,
  current_employee_id uuid references public.employees(id) on delete set null,
  current_site_id uuid references public.sites(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  legacy_vehicle_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, plate_number),
  unique (organization_id, vehicle_code)
);

create index vehicles_org_employee_idx
  on public.vehicles (organization_id, current_employee_id);

create index vehicles_org_status_idx
  on public.vehicles (organization_id, status);

create index vehicles_org_type_idx
  on public.vehicles (organization_id, vehicle_type);

create trigger trg_vehicles_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();


create table public.vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  document_type text not null,
  series_number text,
  issue_date date,
  expiry_date date,
  cost numeric(12,2),
  supplier text,
  status text not null default 'active',
  file_url text,
  notes text,
  legacy_document_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicle_documents_vehicle_idx
  on public.vehicle_documents (vehicle_id, expiry_date);

create index vehicle_documents_org_type_idx
  on public.vehicle_documents (organization_id, document_type, status);

create trigger trg_vehicle_documents_updated_at
before update on public.vehicle_documents
for each row execute function public.set_updated_at();


create table public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  site_id uuid references public.sites(id) on delete set null,
  maintenance_type text not null,
  title text,
  description text,
  status text not null default 'open',
  maintenance_date date not null,
  due_date date,
  estimated_cost numeric(12,2),
  final_cost numeric(12,2),
  supplier text,
  notes text,
  legacy_revision_id text unique,
  legacy_defect_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index maintenance_logs_vehicle_idx
  on public.maintenance_logs (vehicle_id, maintenance_date);

create index maintenance_logs_status_idx
  on public.maintenance_logs (organization_id, status);

create index maintenance_logs_type_idx
  on public.maintenance_logs (organization_id, maintenance_type);

create trigger trg_maintenance_logs_updated_at
before update on public.maintenance_logs
for each row execute function public.set_updated_at();


create table public.fuel_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  site_id uuid references public.sites(id) on delete set null,
  source_type text not null default 'station',
  operation_type text not null default 'fueling',
  fuel_type text,
  station_name text,
  quantity_liters numeric(12,3) not null,
  total_cost numeric(12,2),
  unit_price numeric(12,4),
  odometer_km numeric(12,2),
  operation_date timestamptz not null default now(),
  reference_no text,
  notes text,
  legacy_fuel_id text unique,
  legacy_tank_transaction_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index fuel_logs_vehicle_idx
  on public.fuel_logs (vehicle_id, operation_date);

create index fuel_logs_employee_idx
  on public.fuel_logs (employee_id, operation_date);

create index fuel_logs_org_source_idx
  on public.fuel_logs (organization_id, source_type, operation_type);

create trigger trg_fuel_logs_updated_at
before update on public.fuel_logs
for each row execute function public.set_updated_at();


create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  site_id uuid references public.sites(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  expense_type text not null,
  amount numeric(14,2) not null,
  currency text not null default 'RON',
  expense_date date not null,
  vendor text,
  reference_no text,
  status text not null default 'draft',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_org_date_idx
  on public.expenses (organization_id, expense_date);

create index expenses_project_idx
  on public.expenses (project_id, expense_date);

create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();


create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by_user_profile_id uuid references public.user_profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  file_name text not null,
  file_path text not null,
  file_url text,
  mime_type text,
  file_size bigint,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index attachments_entity_idx
  on public.attachments (organization_id, entity_type, entity_id);

create index attachments_uploaded_by_idx
  on public.attachments (uploaded_by_user_profile_id, created_at);

create trigger trg_attachments_updated_at
before update on public.attachments
for each row execute function public.set_updated_at();


create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_profile_id uuid references public.user_profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  message text,
  payload jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index activity_logs_org_entity_idx
  on public.activity_logs (organization_id, entity_type, entity_id);

create index activity_logs_actor_idx
  on public.activity_logs (actor_user_profile_id, created_at);

create index activity_logs_action_idx
  on public.activity_logs (organization_id, action, created_at);

create trigger trg_activity_logs_updated_at
before update on public.activity_logs
for each row execute function public.set_updated_at();
