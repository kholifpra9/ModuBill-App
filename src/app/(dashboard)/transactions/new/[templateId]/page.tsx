import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "./transaction-form";
import { ArrowLeft, Receipt } from "lucide-react";

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
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Navigation & Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/transactions"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          title="Kembali Pilih Template"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {template.document_title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Template Aktif:{" "}
            <span className="font-semibold text-slate-700">"{template.name}"</span>
          </p>
        </div>
      </div>

      {/* Main Interactive Form Component */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <TransactionForm
          templateId={template.id}
          columns={template.columns_schema ?? []}
          documentFields={template.document_fields ?? []}
          formulas={template.formulas_schema ?? []}
        />
      </div>

    </div>
  );
}