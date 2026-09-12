"use client";

import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { extractReferencedKeys } from "@/lib/math/engine";
import {
  templateFormulaSchema,
  MAX_FORMULAS_PER_TEMPLATE,
  type TemplateColumn,
  type DocumentField,
  type TemplateFormula,
} from "@/lib/schemas/template";
import { z } from "zod";

import {
  Plus,
  Trash2,
  Save,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

const formSchema = z.object({
  formulas: z.array(templateFormulaSchema).max(MAX_FORMULAS_PER_TEMPLATE),
});
type FormValues = z.infer<typeof formSchema>;

type Term = { sign: "+" | "-"; aggregate: "none" | "SUM" | "AVG"; field_key: string };

// ----------------------------------------------------------------------
// SUB-KOMPONEN 1: BARIS RUMUS BARIS (LINE ITEM)
// ----------------------------------------------------------------------
function LineItemFormulaRow({
  index,
  initialFormula,
  lineItemInputs,
  lineItemTargets,
  onUpdate,
  onRemove,
}: {
  index: number;
  initialFormula: TemplateFormula;
  lineItemInputs: TemplateColumn[];
  lineItemTargets: TemplateColumn[];
  onUpdate: (index: number, formula: TemplateFormula) => void;
  onRemove: (index: number) => void;
}) {
  const initialParts = initialFormula.expression.split(" ").filter(Boolean);
  const [operandA, setOperandA] = useState(initialParts.length === 3 ? initialParts[0] : "");
  const [operator, setOperator] = useState(initialParts.length === 3 ? initialParts[1] : "*");
  const [operandB, setOperandB] = useState(initialParts.length === 3 ? initialParts[2] : "");
  const [target, setTarget] = useState(initialFormula.target_field_key);

  function commit(next: { a?: string; op?: string; b?: string; t?: string }) {
    const a = next.a ?? operandA;
    const op = next.op ?? operator;
    const b = next.b ?? operandB;
    const t = next.t ?? target;
    onUpdate(index, {
      target_field_key: t,
      scope: "line_item",
      expression: a && b ? `${a} ${op} ${b}` : "",
    });
  }

  // Cari label manusiawi untuk live preview
  const labelA = lineItemInputs.find((c) => c.field_key === operandA)?.label || "...";
  const labelB = lineItemInputs.find((c) => c.field_key === operandB)?.label || "...";
  const labelTarget = lineItemTargets.find((c) => c.field_key === target)?.label || "...";

  const operatorSymbolMap: Record<string, string> = {
    "*": "×",
    "+": "+",
    "-": "−",
    "/": "÷",
  };

  return (
    <div className="p-4 bg-amber-50/30 border border-amber-200 rounded-xl space-y-3 transition-all">
      <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Rumus Baris (Line Item)
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Hapus Rumus Baris Ini"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Inputs Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
        {/* Field Operand A */}
        <div className="sm:col-span-3">
          <select
            value={operandA}
            onChange={(e) => {
              setOperandA(e.target.value);
              commit({ a: e.target.value });
            }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer focus:outline-none"
          >
            <option value="">Pilih Kolom A...</option>
            {lineItemInputs.map((c) => (
              <option key={c.field_key} value={c.field_key}>
                {c.label || c.field_key}
              </option>
            ))}
          </select>
        </div>

        {/* Operator */}
        <div className="sm:col-span-2">
          <select
            value={operator}
            onChange={(e) => {
              setOperator(e.target.value);
              commit({ op: e.target.value });
            }}
            className="w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer focus:outline-none text-center"
          >
            <option value="*">× (Kali)</option>
            <option value="+">+ (Tambah)</option>
            <option value="-">− (Kurang)</option>
            <option value="/">÷ (Bagi)</option>
          </select>
        </div>

        {/* Field Operand B */}
        <div className="sm:col-span-3">
          <select
            value={operandB}
            onChange={(e) => {
              setOperandB(e.target.value);
              commit({ b: e.target.value });
            }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer focus:outline-none"
          >
            <option value="">Pilih Kolom B...</option>
            {lineItemInputs.map((c) => (
              <option key={c.field_key} value={c.field_key}>
                {c.label || c.field_key}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden sm:block text-center text-slate-400 font-bold sm:col-span-1">
          =
        </div>

        {/* Target Field */}
        <div className="sm:col-span-3">
          <select
            value={target}
            onChange={(e) => {
              setTarget(e.target.value);
              commit({ t: e.target.value });
            }}
            className="w-full px-3 py-2 text-xs font-semibold text-amber-900 rounded-lg border border-amber-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer focus:outline-none"
          >
            <option value="">Hasil Ke Kolom...</option>
            {lineItemTargets.map((c) => (
              <option key={c.field_key} value={c.field_key}>
                {c.label || c.field_key}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Human Readable Live Preview */}
      <div className="p-2 bg-amber-100/50 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5 font-mono">
        <Sparkles size={12} className="text-amber-600 shrink-0" />
        <span>
          Preview: ({labelA}) {operatorSymbolMap[operator]} ({labelB}) = <strong className="text-amber-900">{labelTarget}</strong>
        </span>
      </div>

      {lineItemTargets.length === 0 && (
        <p className="text-xs text-amber-700 bg-amber-100/80 p-2 rounded-lg">
          ⚠️ Belum ada kolom bertipe <strong>"Hasil Rumus"</strong>. Buka tab <strong>Kolom Tabel</strong> dan ubah salah satu jenis data kolom menjadi "Hasil Rumus (Otomatis)".
        </p>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-KOMPONEN 2: BARIS RUMUS DOKUMEN (DOCUMENT LEVEL)
// ----------------------------------------------------------------------
function DocumentLevelFormulaRow({
  index,
  initialFormula,
  documentTargets,
  documentLevelSources,
  onUpdate,
  onRemove,
}: {
  index: number;
  initialFormula: TemplateFormula;
  documentTargets: DocumentField[];
  documentLevelSources: (TemplateColumn | DocumentField)[];
  onUpdate: (index: number, formula: TemplateFormula) => void;
  onRemove: (index: number) => void;
}) {
  function parseTerms(expression: string): Term[] {
    if (!expression) return [{ sign: "+", aggregate: "none", field_key: "" }];
    return expression.split(/\s+/).reduce<Term[]>((acc, token) => {
      if (token === "+" || token === "-") {
        acc.push({ sign: token, aggregate: "none", field_key: "" });
      } else {
        const aggMatch = token.match(/^(SUM|AVG)\((.+)\)$/);
        const last = acc[acc.length - 1] ?? { sign: "+", aggregate: "none", field_key: "" };
        if (aggMatch) {
          last.aggregate = aggMatch[1] as "SUM" | "AVG";
          last.field_key = aggMatch[2];
        } else {
          last.field_key = token;
        }
        if (acc.length === 0) acc.push(last);
      }
      return acc;
    }, []);
  }

  const [target, setTarget] = useState(initialFormula.target_field_key);
  const [terms, setTerms] = useState<Term[]>(parseTerms(initialFormula.expression));

  function buildExpression(ts: Term[]): string {
    return ts
      .map((t, i) => {
        const core = t.aggregate !== "none" ? `${t.aggregate}(${t.field_key})` : t.field_key;
        if (i === 0 && t.sign === "+") return core;
        return `${t.sign} ${core}`;
      })
      .join(" ");
  }

  function commit(nextTerms: Term[], nextTarget: string) {
    onUpdate(index, {
      target_field_key: nextTarget,
      scope: "document_level",
      expression: buildExpression(nextTerms),
    });
  }

  function updateTerm(tIndex: number, patch: Partial<Term>) {
    const next = terms.map((t, i) => (i === tIndex ? { ...t, ...patch } : t));
    setTerms(next);
    commit(next, target);
  }

  function addTerm() {
    const next = [...terms, { sign: "+" as const, aggregate: "none" as const, field_key: "" }];
    setTerms(next);
    commit(next, target);
  }

  function removeTerm(tIndex: number) {
    const next = terms.filter((_, i) => i !== tIndex);
    setTerms(next);
    commit(next, target);
  }

  function handleTargetChange(value: string) {
    setTarget(value);
    commit(terms, value);
  }

  const targetLabel = documentTargets.find((d) => d.field_key === target)?.label || "...";

  return (
    <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-xl space-y-3 transition-all">
      <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Rumus Dokumen / Ringkasan (Document Level)
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Hapus Rumus Dokumen Ini"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Select Target Field Ringkasan */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">
          Hasil Perhitungan Disimpan Ke Field Ringkasan:
        </label>
        <select
          value={target}
          onChange={(e) => handleTargetChange(e.target.value)}
          className="w-full px-3.5 py-2 text-xs font-semibold text-blue-900 rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer focus:outline-none"
        >
          <option value="">Pilih Target Field Ringkasan...</option>
          {documentTargets.map((d) => (
            <option key={d.field_key} value={d.field_key}>
              {d.label || d.field_key}
            </option>
          ))}
        </select>
      </div>

      {/* Terms Generator */}
      <div className="space-y-2 pt-1">
        <label className="block text-xs font-semibold text-slate-700">
          Susunan Komponen Operasi Rumus:
        </label>

        {terms.map((term, tIndex) => {
          const fieldLabel =
            documentLevelSources.find((s) => s.field_key === term.field_key)?.label || "...";

          return (
            <div key={tIndex} className="flex items-center gap-2 flex-wrap bg-white p-2 rounded-lg border border-slate-200">
              {tIndex > 0 && (
                <select
                  value={term.sign}
                  onChange={(e) => updateTerm(tIndex, { sign: e.target.value as "+" | "-" })}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-800 rounded-md border border-slate-300 bg-slate-50 cursor-pointer focus:outline-none"
                >
                  <option value="+">+</option>
                  <option value="-">−</option>
                </select>
              )}

              <select
                value={term.aggregate}
                onChange={(e) =>
                  updateTerm(tIndex, { aggregate: e.target.value as Term["aggregate"] })
                }
                className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white cursor-pointer focus:outline-none"
              >
                <option value="none">Nilai Langsung</option>
                <option value="SUM">SUM (Jumlahkan Semua Baris)</option>
                <option value="AVG">AVG (Rata-rata Semua Baris)</option>
              </select>

              <select
                value={term.field_key}
                onChange={(e) => updateTerm(tIndex, { field_key: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white cursor-pointer focus:outline-none min-w-[150px]"
              >
                <option value="">Pilih Sumber Field...</option>
                {documentLevelSources.map((s) => (
                  <option key={s.field_key} value={s.field_key}>
                    {s.label || s.field_key}
                  </option>
                ))}
              </select>

              {terms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTerm(tIndex)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  title="Hapus Term Ini"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addTerm}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-200"
        >
          <Plus size={14} />
          <span>Tambah Komponen Rumus (Term)</span>
        </button>
      </div>

      {/* Live Expression Preview */}
      <div className="p-2 bg-blue-100/50 rounded-lg text-[11px] text-blue-800 flex items-center gap-1.5 font-mono">
        <Sparkles size={12} className="text-blue-600 shrink-0" />
        <span>
          Preview Hasil: <strong>{targetLabel}</strong> = {buildExpression(terms)}
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// KOMPONEN UTAMA BUILDER FORM
// ----------------------------------------------------------------------
export function FormulaBuilderForm({
  templateId,
  columns,
  documentFields,
  initialFormulas,
}: {
  templateId: string;
  columns: TemplateColumn[];
  documentFields: DocumentField[];
  initialFormulas: TemplateFormula[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: { formulas: initialFormulas },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "formulas",
  });

  const allKeys = new Set([
    ...columns.map((c) => c.field_key),
    ...documentFields.map((d) => d.field_key),
  ]);

  const lineItemInputs = columns.filter((c) => c.data_type !== "formula_output");
  const lineItemTargets = columns.filter((c) => c.data_type === "formula_output");
  const documentTargets = documentFields.filter((d) => d.kind === "computed");
  const documentLevelSources = [...columns, ...documentFields];

  function updateFormula(index: number, formula: TemplateFormula) {
    setValue(`formulas.${index}`, formula, { shouldDirty: true });
  }

  function addLineItemFormula() {
    append({ target_field_key: "", scope: "line_item", expression: "" });
  }

  function addDocumentLevelFormula() {
    append({ target_field_key: "", scope: "document_level", expression: "" });
  }

  async function onSubmit(values: FormValues) {
    setSaveError(null);

    for (const f of values.formulas) {
      if (!f.target_field_key || !allKeys.has(f.target_field_key)) {
        setSaveError("Terdapat rumus dengan target field yang belum dipilih atau tidak valid.");
        return;
      }
      if (!f.expression) {
        setSaveError(`Rumus untuk target field "${f.target_field_key}" belum lengkap.`);
        return;
      }
      const referenced = extractReferencedKeys(f.expression);
      const invalidRefs = referenced.filter((k: string) => !allKeys.has(k));
      if (invalidRefs.length > 0) {
        setSaveError(
          `Rumus "${f.target_field_key}" mereferensikan pengenal tidak dikenal: ${invalidRefs.join(", ")}`
        );
        return;
      }
    }

    const parsed = z.array(templateFormulaSchema).safeParse(values.formulas);
    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? "Validasi gagal");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("templates")
      .update({ formulas_schema: parsed.data })
      .eq("id", templateId);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }
    router.push("/templates");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Informational Header Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
        <HelpCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold">Panduan Menyusun Rumus</p>
          <p className="text-blue-700 leading-relaxed">
            Anda dapat menyusun 2 jenis rumus: <span className="font-semibold text-amber-900">Rumus Baris</span> (perkalian antar kolom per item, misal: Qty × Harga) dan <span className="font-semibold text-blue-900">Rumus Dokumen</span> (kalkulasi bagian bawah, misal: SUM(Total) - Diskon).
          </p>
        </div>
      </div>

      {/* List Rumus */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-3">
            <p className="text-xs text-slate-500">
              Belum ada rumus matematika yang dikonfigurasi pada template ini.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={addLineItemFormula}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Rumus Baris</span>
              </button>
              <button
                type="button"
                onClick={addDocumentLevelFormula}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Rumus Dokumen</span>
              </button>
            </div>
          </div>
        ) : (
          fields.map((field, index) => {
            const current = field as unknown as TemplateFormula;

            if (current.scope === "line_item") {
              return (
                <LineItemFormulaRow
                  key={field.id}
                  index={index}
                  initialFormula={current}
                  lineItemInputs={lineItemInputs}
                  lineItemTargets={lineItemTargets}
                  onUpdate={updateFormula}
                  onRemove={remove}
                />
              );
            }

            return (
              <DocumentLevelFormulaRow
                key={field.id}
                index={index}
                initialFormula={current}
                documentTargets={documentTargets}
                documentLevelSources={documentLevelSources}
                onUpdate={updateFormula}
                onRemove={remove}
              />
            );
          })
        )}
      </div>

      {/* Action Add Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={addLineItemFormula}
          className="py-2.5 px-4 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 border-dashed rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>Tambah Rumus Baris Item</span>
        </button>

        <button
          type="button"
          onClick={addDocumentLevelFormula}
          className="py-2.5 px-4 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 border-dashed rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>Tambah Rumus Dokumen / Ringkasan</span>
        </button>
      </div>

      {/* Save Error Alert */}
      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Form Bottom Bar Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <Link
          href="/templates"
          className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          Batal
        </Link>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-60 shadow-sm"
        >
          {saving ? (
            <span>Menyimpan...</span>
          ) : (
            <>
              <Save size={16} />
              <span>Simpan Rumus</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
}