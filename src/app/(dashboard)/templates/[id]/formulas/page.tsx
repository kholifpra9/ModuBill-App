import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormulaBuilderForm } from "./formula-builder-form";

export default async function FormulasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: template, error } = await supabase
    .from("templates")
    .select("id, name, columns_schema, document_fields, formulas_schema")
    .eq("id", id)
    .single();

  if (error || !template) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Rumus — {template.name}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Hubungkan kolom tabel & field ringkasan dengan rumus matematika.
      </p>
      <FormulaBuilderForm
        templateId={template.id}
        columns={template.columns_schema}
        documentFields={template.document_fields}
        initialFormulas={template.formulas_schema}
      />
    </div>
  );
}