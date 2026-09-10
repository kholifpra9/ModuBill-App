import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, document_title, is_default")
    .order("is_default", { ascending: false });

  if (!templates || templates.length === 0) {
    return (
      <p className="text-gray-500">
        Belum ada template. <Link href="/templates/new" className="underline">Buat dulu</Link>.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Buat Transaksi</h1>
      <p className="text-sm text-gray-500">Pilih template:</p>
      {templates.map((t) => (
        <Link
          key={t.id}
          href={`/transactions/new/${t.id}`}
          className="block border rounded p-4 hover:bg-gray-50"
        >
          {t.name} {t.is_default && <span className="text-xs bg-black text-white rounded px-2 py-0.5 ml-2">Default</span>}
        </Link>
      ))}
    </div>
  );
}