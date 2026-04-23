create table if not exists public.trip_sheets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  trip_code text,
  departure_date date not null,
  start_location text,
  destination text not null,
  trip_purpose text,
  odometer_start numeric(12,2) not null default 0,
  odometer_end numeric(12,2) not null default 0,
  distance_km numeric(12,2) not null default 0,
  status text not null default 'raportata',
  odometer_photo_url text,
  odometer_ocr_km numeric(12,2),
  legacy_trip_sheet_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, trip_code)
);

create index if not exists trip_sheets_org_vehicle_idx
  on public.trip_sheets (organization_id, vehicle_id, departure_date desc);

create index if not exists trip_sheets_org_employee_idx
  on public.trip_sheets (organization_id, employee_id, departure_date desc);

create index if not exists trip_sheets_org_status_idx
  on public.trip_sheets (organization_id, status, departure_date desc);

drop trigger if exists trg_trip_sheets_updated_at on public.trip_sheets;
create trigger trg_trip_sheets_updated_at
before update on public.trip_sheets
for each row execute function public.set_updated_at();
