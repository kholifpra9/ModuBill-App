-- ModuBill — Migration Lengkap (Skema Terkini)
-- Semua perubahan skema digabung jadi 1 file, ditulis IDEMPOTENT (aman
-- dijalankan ulang tanpa error walau sebagian sudah pernah diterapkan
-- manual sebelumnya). Urutan section di bawah mengikuti urutan histori
-- perubahan aslinya — lihat ModuBill-PRD-Progress.md untuk konteks tiap
-- bagian (§2-§5 untuk skema awal, §2 untuk trigger profile, §5 & §10
-- untuk document_values, §2 & §8 untuk storage logo).

-- =========================================================
-- BAGIAN 1: SKEMA AWAL
-- profiles, templates (JSONB penuh untuk columns/formulas/document
-- fields), invoices, invoice_items, RLS policies, trigger auto-default
-- template pertama.
-- =========================================================

-- 1.1 PROFILES (data tambahan di atas Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  logo_url text,
  created_at timestamptz default now()
);

-- 1.2 TEMPLATES (columns_schema, formulas_schema, document_fields = JSONB)
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  document_title text not null,
  orientation text not null check (orientation in ('portrait_58mm','portrait_80mm','landscape_a4','landscape_letter')),
  notes text,
  footer text,
  is_default boolean not null default false,
  columns_schema jsonb not null default '[]'::jsonb,
  formulas_schema jsonb not null default '[]'::jsonb,
  document_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists uniq_default_template_per_user
  on public.templates(user_id)
  where is_default = true;

-- 1.3 INVOICES (header transaksi)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.templates(id),
  invoice_number text,
  transaction_date timestamptz not null,
  grand_total numeric,
  document_snapshot jsonb not null,
  share_token text unique,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

-- 1.4 INVOICE ITEMS
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  row_order int not null default 0,
  item_values jsonb not null
);

-- 1.5 Row Level Security
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id);

drop policy if exists "own templates" on public.templates;
create policy "own templates" on public.templates
  for all using (auth.uid() = user_id);

drop policy if exists "own invoices" on public.invoices;
create policy "own invoices" on public.invoices
  for all using (auth.uid() = user_id);

drop policy if exists "own invoice items" on public.invoice_items;
create policy "own invoice items" on public.invoice_items
  for all using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- 1.6 Trigger: auto-jadikan default kalau ini template pertama user
create or replace function public.set_first_template_as_default()
returns trigger as $$
begin
  if not exists (
    select 1 from public.templates where user_id = new.user_id
  ) then
    new.is_default := true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_first_template_as_default on public.templates;
create trigger trg_set_first_template_as_default
  before insert on public.templates
  for each row execute function public.set_first_template_as_default();


-- =========================================================
-- BAGIAN 2: AUTO-CREATE PROFILE VIA DB TRIGGER
-- Menggantikan insert manual dari client saat register — trigger ini
-- jalan atomic di dalam transaksi yang sama dengan insert ke auth.users.
-- =========================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, business_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'business_name', ''));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =========================================================
-- BAGIAN 3: DOCUMENT_VALUES DI INVOICES
-- Menampung SEMUA field ringkasan (kind: "input" seperti Diskon/Uang
-- Diterima, DAN kind: "computed" seperti Subtotal/Grand Total/Kembalian)
-- dalam satu objek JSONB.
-- =========================================================

alter table public.invoices
  add column if not exists document_values jsonb not null default '{}'::jsonb;


-- =========================================================
-- BAGIAN 4: STORAGE BUCKET UNTUK LOGO BISNIS
-- Dipakai fitur upload logo di Settings (opsional) dan ditampilkan
-- kondisional di header halaman Public Share Link.
-- =========================================================

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Policy mengharuskan file disimpan dengan path {user_id}/nama-file.ext,
-- supaya user cuma bisa upload/replace logo miliknya sendiri.
drop policy if exists "own logo upload" on storage.objects;
create policy "own logo upload"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "own logo update" on storage.objects;
create policy "own logo update"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket public: logo perlu bisa diakses tanpa auth, karena ditampilkan
-- juga di halaman Public Share Link (pengunjung tidak login).
drop policy if exists "public read logo" on storage.objects;
create policy "public read logo"
  on storage.objects for select
  using (bucket_id = 'logos');