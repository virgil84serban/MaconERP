alter table public.maintenance_logs
  add column if not exists severity text,
  add column if not exists photo_url text;

create index if not exists maintenance_logs_org_severity_idx
  on public.maintenance_logs (organization_id, severity);
