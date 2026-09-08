# ModuBill — Starter Project

Awalan project sesuai dokumen arsitektur `ModuBill-Architecture-Design.md`.

## Yang sudah disiapkan

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Struktur folder route: `(auth)`, `(dashboard)/templates`, `(dashboard)/transactions`,
  `(dashboard)/history`, `(dashboard)/settings`, `invoice/share/[token]`
- Supabase client (`lib/supabase/client.ts` untuk browser, `server.ts` untuk server,
  termasuk service-role client khusus halaman share publik)
- `middleware.ts` untuk refresh session Supabase otomatis
- Skema Zod (`lib/schemas/template.ts`) untuk `columns_schema`, `document_fields`,
  `formulas_schema` — satu sumber validasi dipakai frontend & backend
- Math engine (`lib/math/engine.ts`) — safe evaluator berbasis `mathjs`
  (bukan `eval()`), lengkap dengan topological sort dependency rumus
- Migrasi SQL awal (`supabase/migrations/0001_init.sql`) — sudah termasuk
  RLS policy dan trigger auto-default template pertama

## Langkah setup

1. **Buat project Supabase** di supabase.com.
2. **Jalankan migrasi**: buka SQL Editor di dashboard Supabase, copy-paste isi
   `supabase/migrations/0001_init.sql`, jalankan.
3. **Isi environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Lalu isi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan
   `SUPABASE_SERVICE_ROLE_KEY` dari Project Settings > API di dashboard Supabase.
4. **Install dependency**:
   ```bash
   npm install
   ```
5. **Jalankan dev server**:
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000

