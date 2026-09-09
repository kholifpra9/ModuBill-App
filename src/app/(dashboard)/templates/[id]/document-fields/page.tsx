import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentFieldsForm } from "./document-fields-form";

export default async function DocumentFieldsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: template, error } = await supabase
    .from("templates")
    .select("id, name, document_fields")
    .eq("id", id)
    .single();

  if (error || !template) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Field Ringkasan — {template.name}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Field yang muncul sekali di bagian bawah dokumen, misal: Subtotal, Diskon, Pajak, Grand Total.
      </p>
      <DocumentFieldsForm templateId={template.id} initialFields={template.document_fields} />
    </div>
  );
}