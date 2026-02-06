-- Create a table for dashboard users/permissions
create table if not exists public.dashboard_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  role text not null check (role in ('admin', 'manager', 'developer', 'sales')),
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.dashboard_users enable row level security;

-- Policy: Admin can do anything
create policy "Admins can do everything on dashboard_users"
  on public.dashboard_users
  for all
  using (
    exists (
      select 1 from public.dashboard_users
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- Policy: Directory/Manager can read
create policy "Managers can view dashboard_users"
  on public.dashboard_users
  for select
  using (
    exists (
      select 1 from public.dashboard_users
      where email = auth.jwt() ->> 'email'
      and role = 'manager'
    )
  );

-- Initial Admin Seed (Important: Replace with the actual admin email)
-- insert into public.dashboard_users (email, role, name)
-- values ('admin@tivro.sa', 'admin', 'Main Admin')
-- on conflict (email) do nothing;

-- Create tables for Sales Module
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text,
  company text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id),
  client_name text,
  amount numeric not null,
  currency text default 'SAR',
  status text check (status in ('draft', 'sent', 'paid', 'overdue')),
  due_date date,
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.quotes (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id),
  client_name text,
  total numeric not null,
  status text check (status in ('draft', 'sent', 'accepted', 'rejected')),
  valid_until date,
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Sales tables (Simplified: Allow authenticated for now, ideally restrict by role)
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.quotes enable row level security;

create policy "Allow all authenticated access to sales tables" on public.clients for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated access to invoices" on public.invoices for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated access to quotes" on public.quotes for all using (auth.role() = 'authenticated');
