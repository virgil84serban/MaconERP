create table if not exists public.fuel_tanks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  max_capacity_liters numeric(12,3) not null default 1000,
  current_level_liters numeric(12,3) not null default 0,
  current_location text,
  status text not null default 'active',
  legacy_tank_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fuel_tanks_org_status_idx
  on public.fuel_tanks (organization_id, status);

drop trigger if exists trg_fuel_tanks_updated_at on public.fuel_tanks;
create trigger trg_fuel_tanks_updated_at
before update on public.fuel_tanks
for each row execute function public.set_updated_at();


create table if not exists public.fuel_tank_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  fuel_tank_id uuid not null references public.fuel_tanks(id) on delete cascade,
  transaction_type text not null,
  quantity_liters numeric(12,3) not null,
  target_vehicle_id uuid references public.vehicles(id) on delete set null,
  utility_label text,
  location text not null,
  created_by_user_profile_id uuid references public.user_profiles(id) on delete set null,
  created_by_user_name text,
  notes text,
  legacy_tank_transaction_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fuel_tank_transactions_org_tank_idx
  on public.fuel_tank_transactions (organization_id, fuel_tank_id, created_at desc);

create index if not exists fuel_tank_transactions_org_type_idx
  on public.fuel_tank_transactions (organization_id, transaction_type, created_at desc);

drop trigger if exists trg_fuel_tank_transactions_updated_at on public.fuel_tank_transactions;
create trigger trg_fuel_tank_transactions_updated_at
before update on public.fuel_tank_transactions
for each row execute function public.set_updated_at();
