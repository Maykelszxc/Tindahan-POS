-- Tindahan POS Supabase schema
-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  buying_price numeric not null default 0,
  selling_price numeric not null default 0,
  stock integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  completed_at timestamptz not null,
  total numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists sale_lines (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  item_id uuid references items(id) on delete set null,
  item_name text not null,
  quantity integer not null,
  unit_price numeric not null,
  line_total numeric not null
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text not null,
  amount numeric not null,
  date date not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table categories enable row level security;
alter table items enable row level security;
alter table sales enable row level security;
alter table sale_lines enable row level security;
alter table expenses enable row level security;

-- Open access policies (fine for a single-store POS with no public sign-in).
-- Tighten these (e.g. auth.role() = 'authenticated') if you add authentication later.
drop policy if exists "public access" on categories;
create policy "public access" on categories for all using (true) with check (true);

drop policy if exists "public access" on items;
create policy "public access" on items for all using (true) with check (true);

drop policy if exists "public access" on sales;
create policy "public access" on sales for all using (true) with check (true);

drop policy if exists "public access" on sale_lines;
create policy "public access" on sale_lines for all using (true) with check (true);

drop policy if exists "public access" on expenses;
create policy "public access" on expenses for all using (true) with check (true);

-- Migration: run this if sale_lines was created before item_id allowed deleting sold items.
alter table sale_lines alter column item_id drop not null;
alter table sale_lines drop constraint if exists sale_lines_item_id_fkey;
alter table sale_lines add constraint sale_lines_item_id_fkey foreign key (item_id) references items(id) on delete set null;
