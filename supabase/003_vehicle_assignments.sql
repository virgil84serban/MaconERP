create table if not exists public.vehicle_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  assignment_code text,
  start_date date not null,
  status text not null default 'active',
  end_reason text,
  notes text,
  legacy_assignment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, assignment_code)
);

create index if not exists vehicle_assignments_org_vehicle_idx
  on public.vehicle_assignments (organization_id, vehicle_id, start_date desc);

create index if not exists vehicle_assignments_org_employee_idx
  on public.vehicle_assignments (organization_id, employee_id, start_date desc);

create index if not exists vehicle_assignments_org_status_idx
  on public.vehicle_assignments (organization_id, status);

drop trigger if exists trg_vehicle_assignments_updated_at on public.vehicle_assignments;
create trigger trg_vehicle_assignments_updated_at
before update on public.vehicle_assignments
for each row execute function public.set_updated_at();
