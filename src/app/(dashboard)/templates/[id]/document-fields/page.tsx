import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DocumentFieldsForm } from "./document-fields-form";
import { ArrowLeft, AlignLeft } from "lucide-react";

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
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header & Navigasi */}
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
            <AlignLeft size={18} className="text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Field Ringkasan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Atur field bagian bawah dokumen (Subtotal, Diskon, Pajak, Grand Total) untuk template{" "}
            <span className="font-semibold text-slate-700">"{template.name}"</span>.
          </p>
        </div>
      </div>

      {/* Pembungkus Form Builder */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <DocumentFieldsForm
          templateId={template.id}
          initialFields={template.document_fields ?? []}
        />
      </div>

    </div>
  );
}