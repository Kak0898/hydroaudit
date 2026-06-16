create extension if not exists "uuid-ossp";

create table if not exists public.machines (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  brand text,
  model text,
  serial_number text,
  category text,
  location text,
  status text not null default 'operativa',
  last_maintenance date,
  next_maintenance date,
  purchase_value numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.spare_parts (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  category text,
  compatible_machine text,
  stock integer not null default 0,
  min_stock integer not null default 1,
  unit_cost numeric,
  supplier text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.audits (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  audit_type text not null default 'inventario',
  status text not null default 'pendiente',
  responsible text,
  scheduled_date date,
  completed_date date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.import_logs (
  id uuid primary key default uuid_generate_v4(),
  import_type text not null,
  total_rows integer default 0,
  success_rows integer default 0,
  error_rows integer default 0,
  created_at timestamptz default now()
);

alter table public.machines enable row level security;
alter table public.spare_parts enable row level security;
alter table public.audits enable row level security;
alter table public.import_logs enable row level security;

create policy "authenticated read machines" on public.machines for select to authenticated using (true);
create policy "authenticated write machines" on public.machines for all to authenticated using (true) with check (true);
create policy "authenticated read spare_parts" on public.spare_parts for select to authenticated using (true);
create policy "authenticated write spare_parts" on public.spare_parts for all to authenticated using (true) with check (true);
create policy "authenticated read audits" on public.audits for select to authenticated using (true);
create policy "authenticated write audits" on public.audits for all to authenticated using (true) with check (true);
create policy "authenticated read import_logs" on public.import_logs for select to authenticated using (true);
create policy "authenticated write import_logs" on public.import_logs for all to authenticated using (true) with check (true);
