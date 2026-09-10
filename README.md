# ModuBill

Dynamic Invoice & Receipt Generator dengan schema kustomisasi — target skala kecil (F&B, hotel kecil, split bill antar teman).

Dokumen pendukung:
- `ModuBill-Architecture-Design.md` — arsitektur & skema database awal
- `ModuBill-PRD-Progress.md` — status implementasi terkini, spesifikasi final tiap modul, known issues

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Form & Validasi**: react-hook-form + Zod
- **Backend & DB**: Supabase (Auth, Postgres dengan RLS, Storage)
- **Math Engine**: mathjs (safe evaluator, whitelist-by-scope — lihat catatan di bawah)
- **PDF/Thermal Print**: @react-pdf/renderer, ESC/POS + Web Bluetooth/WebUSB *(belum diimplementasikan)*

## Struktur Project

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Redirect ke /settings kalau sudah login
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Redirect ke /login kalau belum login
│   │   ├── settings/page.tsx       # Profil bisnis (opsional)
│   │   ├── templates/
│   │   │   ├── page.tsx            # List + set default + delete
│   │   │   ├── new/page.tsx        # Create template
│   │   │   └── [id]/
│   │   │       ├── columns/        # Dynamic Column Builder
│   │   │       ├── document-fields/# Document Fields Builder
│   │   │       └── formulas/       # Formula Builder
│   │   ├── transactions/
│   │   │   ├── page.tsx            # Pilih template
│   │   │   └── new/[templateId]/   # Form input + live calculation
│   │   └── history/
│   │       ├── page.tsx            # List (soft-delete aware)
│   │       └── [id]/page.tsx       # Detail (baca dari document_snapshot)
│   └── invoice/share/[token]/      # Placeholder, belum diimplementasikan
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser client
│   │   └── server.ts                # Server client + service-role client
│   ├── schemas/
│   │   ├── auth.ts                  # registerSchema, loginSchema
│   │   ├── profile.ts                # profileSchema
│   │   └── template.ts               # columns_schema/document_fields/formulas_schema
│   └── math/
│       └── engine.ts                 # Safe evaluator (whitelist-by-scope)
├── components/
│   └── logout-button.tsx
└── middleware.ts                      # Refresh session Supabase

supabase/migrations/
└── 0001_init.sql
```

## Setup

1. **Buat project Supabase** di supabase.com.
2. **Jalankan migrasi** — copy isi `supabase/migrations/0001_init.sql` ke SQL Editor Supabase, jalankan. **Termasuk** trigger `on_auth_user_created` dan trigger auto-default template pertama.
3. **Tambahan migrasi** (belum masuk file migrasi utama, jalankan manual):
   ```sql
   alter table public.invoices
     add column document_values jsonb not null default '{}'::jsonb;
   ```
4. **Environment variables**: `cp .env.example .env.local`, isi dari Project Settings → API di dashboard Supabase.
5. **Matikan email confirmation** (untuk development): Authentication → Providers → Email → matikan "Confirm email". Tanpa ini, `signUp()` tidak langsung menghasilkan session aktif.
6. **Storage bucket untuk logo** (opsional, kalau mau pakai fitur upload logo di Settings):
   ```sql
   insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict (id) do nothing;
   create policy "own logo upload" on storage.objects for insert
     with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
   create policy "own logo update" on storage.objects for update
     using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
   create policy "public read logo" on storage.objects for select using (bucket_id = 'logos');
   ```
7. `npm install` → `npm run dev`.

## Status Fitur

✅ **Selesai & teruji**: Auth (register/login/logout, route protection 2 arah), Business Profile, Template CRUD, Dynamic Column Builder, Document Fields Builder, Formula Builder (line item + document level), Math Engine (safe evaluator), Transaction Generator (live calculation), History (list + detail + soft delete).

⬜ **Belum dikerjakan**: PDF Generator, Thermal Print (ESC/POS), Public Share Link + QR Code.

Detail lengkap tiap modul (termasuk keputusan desain & known issues) ada di `ModuBill-PRD-Progress.md`.

## Catatan Penting Sebelum Lanjut Development

- **`field_key` itu ID internal permanen** — jangan pernah rename/renumber manual di database. Gap seperti `field_1`, `field_4` (setelah kolom tengah dihapus) itu normal, bukan bug.
- **Math engine pakai whitelist-by-scope**, bukan blacklist nama fungsi. Kalau nanti perlu nambah fungsi baru ke `engine.ts`, jangan pakai pola `math.import({ namaFungsi: () => throw })` untuk "mematikan" fungsi — itu bisa menimpa method asli mathjs (sudah kejadian 2x, lihat §6 PRD).
- **Data transaksi (`invoices`) bersifat read-only** dari sisi UI — tidak ada halaman edit invoice, sesuai keputusan PRD awal (riwayat harus jadi bukti yang tidak berubah).
- Kalau nambah field ringkasan baru di Document Fields Builder, otomatis ke-cover di Transaction Generator & History tanpa perlu ubah kode — kecuali kamu mengganti nama field grand total dari `"grand_total"` ke nama lain, itu satu tempat yang perlu disesuaikan manual (lihat komentar di `transaction-form.tsx`).