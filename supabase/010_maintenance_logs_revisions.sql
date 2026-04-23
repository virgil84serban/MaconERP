alter table public.maintenance_logs
  add column if not exists odometer_km numeric(12,2),
  add column if not exists revision_type text,
  add column if not exists service_name text;

create index if not exists maintenance_logs_org_revision_type_idx
  on public.maintenance_logs (organization_id, revision_type);
