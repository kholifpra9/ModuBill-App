import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { Pagination } from "@/components/ui/pagination";
import { SoftDeleteButton } from "./soft-delete-button";
import { History, FileText, Calendar, Eye } from "lucide-react";
import { formatTransactionDate } from "@/lib/utils/format-date";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
};

interface HistoryPageProps {
  searchParams: Promise<{
    q?: string;          // Live Search Invoice Number
    template_id?: string; // Filter Template Name
    page?: string;        // Current Page Number
  }>;
}

const PAGE_SIZE = 10; // Jumlah data per halaman

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const { q, template_id, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));

  const supabase = await createClient();

  // 1. Ambil Session User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // 2. Fetch Opsi Template milik user untuk Dropdown Filter
  const { data: templates } = await supabase
    .from("templates")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const filterOptions = (templates ?? []).map((t) => ({
    label: t.name,
    value: t.id,
  }));

  // 3. Hitung total dulu (query terpisah, TANPA .range()) — supaya query
  // data (yang pakai range) tidak pernah dikirim dengan angka range yang
  // sudah pasti tidak valid gara-gara currentPage kebesaran.
  let countQuery = supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (q && q.trim()) {
    countQuery = countQuery.ilike("invoice_number", `%${q.trim()}%`);
  }
  if (template_id && template_id.trim()) {
    countQuery = countQuery.eq("template_id", template_id);
  }

  const { count } = await countQuery;
  const totalItems = count ?? 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  if (totalPages > 0 && currentPage > totalPages) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (template_id) params.set("template_id", template_id);
    params.set("page", String(totalPages));
    redirect(`/history?${params.toString()}`);
  }

  // 4. Baru fetch data beneran — di titik ini currentPage SUDAH DIJAMIN valid
  // (kalau kebesaran, sudah keburu redirect di atas)
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("invoices")
    .select("*, templates(name)")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (q && q.trim()) {
    query = query.ilike("invoice_number", `%${q.trim()}%`);
  }
  if (template_id && template_id.trim()) {
    query = query.eq("template_id", template_id);
  }

  const { data: invoices, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching history invoices:", error.message);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="text-blue-600" size={24} />
            <span>Riwayat Transaksi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola dan lihat rincian struk/invoice yang telah diterbitkan.
          </p>
        </div>
      </div>

      {/* Control Bar: Live Search & Filter Template */}
      <Suspense fallback={<div className="h-[52px] bg-slate-50 border border-slate-200 rounded-2xl animate-pulse" />}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 border border-slate-200 rounded-2xl">
          <SearchInput placeholder="Cari No. Invoice (mis: INV-2026...)" />
          <FilterSelect
            options={filterOptions}
            paramKey="template_id"
            placeholder="Semua Template"
          />
        </div>
      </Suspense>

      {/* Tabel/Daftar Transaksi (Sederhana Asli) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {invoices && invoices.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const templateName =
                (inv.templates as { name?: string })?.name ?? "Template Dihapus";

              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Information Link (Klik ke Detail) */}
                  <Link
                    href={`/history/${inv.id}`}
                    className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center cursor-pointer pr-3"
                  >
                    {/* Nomor Invoice & Template */}
                    <div className="sm:col-span-6 space-y-0.5">
                      {/* Element Paling Menonjol (PRD §6.9) */}
                      <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <span>
                          {inv.invoice_number ?? `#${inv.id.slice(0, 8)}`}
                        </span>
                      </p>
                      {/* Element Terkecil (PRD §6.9) */}
                      <p className="text-xs text-slate-400">
                        {templateName}
                      </p>
                    </div>

                    {/* Tanggal Transaksi */}
                    <div className="sm:col-span-3 text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <span>{formatTransactionDate(inv.transaction_date,{})}</span>
                    </div>

                    {/* Grand Total */}
                    <div className="sm:col-span-3 sm:text-right font-mono font-bold text-slate-900 text-sm">
                      {inv.grand_total != null
                        ? formatCurrency(Number(inv.grand_total))
                        : "—"}
                    </div>
                  </Link>

                  {/* Right Action & Soft Delete */}
                  <div className="flex items-center gap-1 border-l border-slate-100 pl-2">
                    <Link
                      href={`/history/${inv.id}`}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </Link>
                    <SoftDeleteButton invoiceId={inv.id} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 text-center space-y-2">
            <FileText size={36} className="mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              Data transaksi tidak ditemukan
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {q || template_id
                ? "Coba ubah kata kunci pencarian atau filter yang kamu gunakan."
                : "Belum ada transaksi yang disimpan. Buat transaksi pertama kamu sekarang."}
            </p>
          </div>
        )}

        {/* Paginasi Reusabel */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <Suspense fallback={<div className="h-10" />}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}