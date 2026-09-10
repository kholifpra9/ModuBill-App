import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "./transaction-form";

export default async function NewTransactionPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const supabase = await createClient();

  const { data: template, error } = await supabase
    .from("templates")
    .select("id, name, document_title, columns_schema, document_fields, formulas_schema")
    .eq("id", templateId)
    .single();

  if (error || !template) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-1">{template.document_title}</h1>
      <p className="text-sm text-gray-500 mb-4">Template: {template.name}</p>
      <TransactionForm
        templateId={template.id}
        columns={template.columns_schema}
        documentFields={template.document_fields}
        formulas={template.formulas_schema}
      />
    </div>
  );
}