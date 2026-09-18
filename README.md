<p align="left">
  <img src="./public/modubill-logo-full.svg" alt="ModuBill" height="40" />
</p>

# ModuBill

Dynamic Invoice & Receipt Generator dengan schema kustomisasi — target skala kecil (F&B, hotel kecil, split bill antar teman).

Dokumen pendukung:
- `ModuBill-Architecture-Design.md` — arsitektur & skema database awal
- `ModuBill-PRD-Progress.md` — status implementasi terkini, spesifikasi final tiap modul, known issues

## Branding

Logo dikelola lewat komponen `components/ui/modubilllogo.tsx` (varian `full`, `icon`, `monochrome`) — pakai komponen ini untuk menampilkan logo di halaman manapun, jangan hardcode SVG ulang. File SVG statis (`modubill-logo-full.svg`, `modubill-icon.svg`) ada di `public/`, dipakai untuk favicon dan gambar di README ini. Detail keputusan desain logo ada di `ModuBill-Logo-PRD.md`.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Form & Validasi**: react-hook-form + Zod
- **Backend & DB**: Supabase (Auth, Postgres dengan RLS, Storage)
- **Math Engine**: mathjs (safe evaluator, whitelist-by-scope — lihat catatan di bawah)
- **PDF/Print**: `window.print()` dialog browser via komponen `PrintableInvoice` (Portal-based) — selesai. Thermal Print (ESC/POS + Web Bluetooth/WebUSB) *belum diimplementasikan*

## Struktur Project

```
src/
├── app/
│   ├── (public)/                   # Landing page - navbar di atas, sebelum login
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx              # Redirect ke /dashboard kalau sudah login
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/                 # Butuh login, sidebar di kiri
│   │   ├── layout.tsx              # Redirect ke /login kalau belum login
│   │   ├── dashboard/                # Beranda: statistik bulan ini + transaksi terbaru
│   │   ├── settings/                # Profil bisnis (opsional)
│   │   ├── templates/                # CRUD + Column/Document Fields/Formula Builder
│   │   ├── transactions/             # Pilih template + form input (live calculation + print)
│   │   └── history/                  # List (search/filter/pagination) + detail + soft delete
│   ├── invoice/share/[token]/       # Halaman publik, service-role client, tanpa login
│   └── globals.css                   # CSS variables (palet warna, flat design, @media print)
├── components/
│   ├── layout/                       # Navbar, Sidebar, Footer, modal konfirmasi
│   └── ui/                           # Komponen reusable (logo, toast, print, search, dsb)
├── lib/
│   ├── supabase/                     # Browser client, server client (+ service-role)
│   ├── schemas/                      # Zod: auth, profile, template
│   ├── math/                         # Safe evaluator (whitelist-by-scope)
│   └── utils/                        # Helper (invoice number, format tanggal)
└── middleware.ts                     # Refresh session Supabase

supabase/migrations/
└── 0001_full_schema.sql              # Skema lengkap: profiles, templates, invoices, invoice_items, RLS, trigger profile, document_values, storage logo
```

> Tree lengkap sampai level file individual (untuk keperluan development
> sehari-hari) ada di `ModuBill-PRD-Progress.md`, bukan di sini.


## Setup

1. **Buat project Supabase** di supabase.com.
2. **Jalankan migrasi** — buka SQL Editor Supabase, copy-paste seluruh isi `supabase/migrations/0001_full_schema.sql`, jalankan sekali. Ditulis idempotent (aman dijalankan ulang tanpa error), jadi tidak masalah kalau sebagian isinya sudah pernah diterapkan manual sebelumnya.
3. **Environment variables**: `cp .env.example .env.local`, isi dari Project Settings → API di dashboard Supabase.
4. **Matikan email confirmation** (untuk development): Authentication → Providers → Email → matikan "Confirm email". Tanpa ini, `signUp()` tidak langsung menghasilkan session aktif.
5. `npm install` → `npm run dev`.

> Storage bucket untuk logo bisnis (bagian akhir file migrasi) bersifat opsional — cuma dibutuhkan kalau mau pakai fitur upload logo di Settings. Aplikasi tetap jalan normal tanpa itu, fitur upload logo-nya saja yang tidak berfungsi.

## Status Fitur

✅ **Selesai & teruji**: Auth (register/login/logout, route protection 2 arah), Business Profile, Template CRUD, Dynamic Column Builder, Document Fields Builder, Formula Builder (line item + document level), Math Engine (safe evaluator), Transaction Generator (live calculation), History (list + detail + soft delete + search/filter/pagination), Dashboard (statistik + transaksi terbaru), Toast Notification, Public Share Link + QR Code, PDF/Print via dialog browser (Transaction Generator & History).

✅ **Desain & polish**: Landing Page, Auth, Templates, Transactions, History, Settings, Dashboard — flat design konsisten lewat `globals.css`, komponen layout reusable (Navbar, Sidebar, Footer), modal konfirmasi untuk aksi-aksi penting, logo produk ("batang modular").

⬜ **Belum dikerjakan**: Thermal Print (ESC/POS via Bluetooth/WebUSB), ukuran kertas print mengikuti orientasi template.

Detail lengkap tiap modul (termasuk keputusan desain & known issues) ada di `ModuBill-PRD-Progress.md`.

## Catatan Penting Sebelum Lanjut Development

- **`field_key` itu ID internal permanen** — jangan pernah rename/renumber manual di database. Gap seperti `field_1`, `field_4` (setelah kolom tengah dihapus) itu normal, bukan bug.
- **Math engine pakai whitelist-by-scope**, bukan blacklist nama fungsi. Kalau nanti perlu nambah fungsi baru ke `engine.ts`, jangan pakai pola `math.import({ namaFungsi: () => throw })` untuk "mematikan" fungsi — itu bisa menimpa method asli mathjs (sudah kejadian 2x, lihat §10 PRD).
- **Data transaksi (`invoices`) bersifat read-only** dari sisi UI — tidak ada halaman edit invoice, sesuai keputusan PRD awal (riwayat harus jadi bukti yang tidak berubah).
- Kalau nambah field ringkasan baru di Document Fields Builder, otomatis ke-cover di Transaction Generator & History tanpa perlu ubah kode — kecuali kamu mengganti nama field grand total dari `"grand_total"` ke nama lain, itu satu tempat yang perlu disesuaikan manual (lihat komentar di `transaction-form.tsx`).
- **`lib/utils/format-date.ts` dan `transaction-form.tsx` saling bergantung soal timezone** — `formatTransactionDate` memaksa `timeZone: "UTC"` supaya cocok dengan `getNowISO()` yang menyimpan waktu lokal browser berlabel UTC. Jangan ubah salah satu tanpa yang lain, atau jam yang ditampilkan bakal bergeser sejumlah offset timezone (lihat komentar di kedua file).
- **Print (`window.print()`) diisolasi lewat `#app-root` + React Portal**, bukan `visibility:hidden`/`print:hidden` per-elemen — dua pendekatan itu sudah dicoba dan gagal (lihat §9 PRD). Kalau nambah halaman baru yang butuh print, ikuti pola `PrintableInvoice` yang sudah ada, jangan mulai dari CSS `print:hidden` lagi.
- **Migrasi database berikutnya harus jadi file baru** di `supabase/migrations/` (`0002_...sql`, dst) — jangan lagi jalanin perubahan skema langsung lewat SQL Editor tanpa menyimpannya sebagai file. `0001_full_schema.sql` adalah gabungan seluruh perubahan yang sempat "hilang" dari version control sampai dirapikan belakangan — jangan diedit lagi, tambahkan migrasi baru di atasnya.