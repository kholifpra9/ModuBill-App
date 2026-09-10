import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SoftDeleteButton } from "./soft-delete-button";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, transaction_date, grand_total, templates(name)")
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false });

  if (error) {
    return <p className="text-red-500">Gagal memuat riwayat: {error.message}</p>;
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Riwayat Transaksi</h1>

      {invoices.length === 0 ? (
        <p className="text-gray-500">Belum ada transaksi tersimpan.</p>
      ) : (
        <div className="divide-y border rounded">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
              <Link href={`/history/${inv.id}`} className="flex-1">
                <p className="font-semibold">{inv.invoice_number ?? `#${inv.id.slice(0, 8)}`}</p>
                <p className="text-sm text-gray-500">
                  {new Date(inv.transaction_date).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-400">
                  {(inv.templates as unknown as { name: string })?.name ?? "Template terhapus"}
                </p>
              </Link>
              <div className="flex items-center gap-3">
                {inv.grand_total != null && (
                  <p className="text-sm font-medium">
                    Rp {Number(inv.grand_total).toLocaleString("id-ID")}
                  </p>
                )}
                <SoftDeleteButton invoiceId={inv.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}