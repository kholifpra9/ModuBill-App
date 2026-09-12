import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FormulaBuilderForm } from "./formula-builder-form";
import { ArrowLeft, Calculator } from "lucide-react";

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
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header & Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/templates"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          title="Kembali ke Daftar Template"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Rumus Dokumen
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hubungkan kolom tabel dan field ringkasan dengan perhitungan matematika untuk{" "}
            <span className="font-semibold text-slate-700">"{template.name}"</span>.
          </p>
        </div>
      </div>

      {/* Main Builder Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <FormulaBuilderForm
          templateId={template.id}
          columns={template.columns_schema ?? []}
          documentFields={template.document_fields ?? []}
          initialFormulas={template.formulas_schema ?? []}
        />
      </div>

    </div>
  );
}