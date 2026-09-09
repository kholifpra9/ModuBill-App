import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ColumnBuilderForm } from "./column-builder-form";

export default async function ColumnsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: template, error } = await supabase
    .from("templates")
    .select("id, name, columns_schema")
    .eq("id", id)
    .single();

  if (error || !template) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Kolom Tabel — {template.name}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Ini kolom yang akan muncul berulang per baris item (misal: Jumlah, Harga, Total).
      </p>
      <ColumnBuilderForm templateId={template.id} initialColumns={template.columns_schema} />
    </div>
  );
}