import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteTemplateButton } from "./delete-template-button";
import { SetDefaultButton } from "./set-default-button";
import {
  Plus,
  FileCode2,
  LayoutGrid,
  Calculator,
  AlignLeft,
  Check,
  Printer,
  FileText,
} from "lucide-react";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, name, document_title, orientation, is_default, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        Gagal memuat daftar template: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Template Dokumen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola model struktur kolom, field ringkasan, dan rumus struk atau invoice Anda.
          </p>
        </div>

        <Link
          href="/templates/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0"
        >
          <Plus size={18} />
          <span>Buat Template Baru</span>
        </Link>
      </div>

      {/* Main Content Area */}
      {templates.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto my-12">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto">
            <FileCode2 size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Belum Ada Template
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Buat template pertama Anda untuk mulai mengatur susunan kolom dan rumus transaksi harian.
            </p>
          </div>
          <Link
            href="/templates/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Buat Template Pertama</span>
          </Link>
        </div>
      ) : (
        /* List Template Grid */
        <div className="grid grid-cols-1 gap-4">
          {templates.map((t) => {
            const isThermal =
              t.orientation?.toLowerCase().includes("thermal") ||
              t.orientation?.toLowerCase().includes("58") ||
              t.orientation?.toLowerCase().includes("80");

            return (
              <div
                key={t.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Template Identity Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-bold text-slate-900">
                      {t.name}
                    </h2>
                    
                    {/* Badge Default */}
                    {t.is_default && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                        <Check size={12} />
                        Default
                      </span>
                    )}

                    {/* Badge Format Kertas */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full">
                      {isThermal ? (
                        <Printer size={12} className="text-slate-500" />
                      ) : (
                        <FileText size={12} className="text-slate-500" />
                      )}
                      <span>{t.orientation || "Standard"}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Judul Dokumen:{" "}
                    <span className="font-semibold text-slate-700">
                      "{t.document_title}"
                    </span>
                  </p>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2 flex-wrap pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Set Default Action */}
                  {!t.is_default && <SetDefaultButton templateId={t.id} />}

                  {/* Builder Sub-Modul Links */}
                  <Link
                    href={`/templates/${t.id}/columns`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <LayoutGrid size={14} className="text-slate-500" />
                    <span>Kolom</span>
                  </Link>

                  <Link
                    href={`/templates/${t.id}/document-fields`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <AlignLeft size={14} className="text-slate-500" />
                    <span>Field Ringkasan</span>
                  </Link>

                  <Link
                    href={`/templates/${t.id}/formulas`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Calculator size={14} className="text-slate-500" />
                    <span>Rumus</span>
                  </Link>

                  {/* Delete Button */}
                  <DeleteTemplateButton templateId={t.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}