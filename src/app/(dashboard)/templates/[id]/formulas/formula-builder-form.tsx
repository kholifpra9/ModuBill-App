"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const formSchema = z.object({
  formulas: z.array(templateFormulaSchema).max(MAX_FORMULAS_PER_TEMPLATE),
});
type FormValues = z.infer<typeof formSchema>;

type Term = { sign: "+" | "-"; aggregate: "none" | "SUM" | "AVG"; field_key: string };

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

  // Catatan: state lokal (operandA/operator/operandB/target) di sini TIDAK lagi
  // rawan reset, karena onUpdate sekarang memanggil setValue() di parent,
  // bukan update() dari useFieldArray — jadi field.id tidak berubah dan
  // komponen ini tidak remount setiap kali salah satu select dipilih.
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

  return (
    <div className="border rounded p-3 space-y-2">
      <p className="text-xs font-medium text-gray-500">RUMUS BARIS (line item)</p>
      <div className="flex gap-2 items-center flex-wrap">
        <select
          value={operandA}
          onChange={(e) => { setOperandA(e.target.value); commit({ a: e.target.value }); }}
          className="border rounded p-2 text-sm"
        >
          <option value="">Pilih field...</option>
          {lineItemInputs.map((c) => (
            <option key={c.field_key} value={c.field_key}>{c.label}</option>
          ))}
        </select>

        <select
          value={operator}
          onChange={(e) => { setOperator(e.target.value); commit({ op: e.target.value }); }}
          className="border rounded p-2 text-sm"
        >
          <option value="*">×</option>
          <option value="+">+</option>
          <option value="-">−</option>
          <option value="/">÷</option>
        </select>

        <select
          value={operandB}
          onChange={(e) => { setOperandB(e.target.value); commit({ b: e.target.value }); }}
          className="border rounded p-2 text-sm"
        >
          <option value="">Pilih field...</option>
          {lineItemInputs.map((c) => (
            <option key={c.field_key} value={c.field_key}>{c.label}</option>
          ))}
        </select>

        <span className="text-sm">=</span>

        <select
          value={target}
          onChange={(e) => { setTarget(e.target.value); commit({ t: e.target.value }); }}
          className="border rounded p-2 text-sm"
        >
          <option value="">Hasil ke...</option>
          {lineItemTargets.map((c) => (
            <option key={c.field_key} value={c.field_key}>{c.label}</option>
          ))}
        </select>

        <button type="button" onClick={() => onRemove(index)} className="text-xs text-red-500 border border-red-200 rounded px-2 py-1 ml-auto">
          Hapus
        </button>
      </div>
      {lineItemTargets.length === 0 && (
        <p className="text-xs text-amber-600">
          Belum ada kolom bertipe &quot;Formula Output&quot; — buka Kolom Tabel dulu, ubah salah satu kolom jadi tipe itu.
        </p>
      )}
    </div>
  );
}

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

  // State lokal (bukan getValues()) — supaya React tahu harus re-render
  // setiap kali term ditambah/diubah. setValue() ke form TIDAK memicu
  // re-render dengan sendirinya, makanya kemarin tombolnya "diem" aja.
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

  return (
    <div className="border rounded p-3 space-y-2">
      <p className="text-xs font-medium text-gray-500">RUMUS DOKUMEN (document level)</p>

      <select
        value={target}
        onChange={(e) => handleTargetChange(e.target.value)}
        className="border rounded p-2 text-sm w-full"
      >
        <option value="">Hasil ke field ringkasan...</option>
        {documentTargets.map((d) => (
          <option key={d.field_key} value={d.field_key}>{d.label}</option>
        ))}
      </select>

      <div className="space-y-1">
        {terms.map((term, tIndex) => (
          <div key={tIndex} className="flex gap-2 items-center flex-wrap">
            {tIndex > 0 && (
              <select
                value={term.sign}
                onChange={(e) => updateTerm(tIndex, { sign: e.target.value as "+" | "-" })}
                className="border rounded p-2 text-sm"
              >
                <option value="+">+</option>
                <option value="-">−</option>
              </select>
            )}
            <select
              value={term.aggregate}
              onChange={(e) => updateTerm(tIndex, { aggregate: e.target.value as Term["aggregate"] })}
              className="border rounded p-2 text-sm"
            >
              <option value="none">Langsung</option>
              <option value="SUM">SUM (jumlah semua baris)</option>
              <option value="AVG">AVG (rata-rata semua baris)</option>
            </select>
            <select
              value={term.field_key}
              onChange={(e) => updateTerm(tIndex, { field_key: e.target.value })}
              className="border rounded p-2 text-sm"
            >
              <option value="">Pilih field...</option>
              {documentLevelSources.map((s) => (
                <option key={s.field_key} value={s.field_key}>{s.label}</option>
              ))}
            </select>
            {terms.length > 1 && (
              <button type="button" onClick={() => removeTerm(tIndex)} className="text-xs text-red-500">
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addTerm} className="text-xs border rounded px-2 py-1">
          + Tambah term
        </button>
      </div>

      <button type="button" onClick={() => onRemove(index)} className="text-xs text-red-500 border border-red-200 rounded px-2 py-1">
        Hapus Rumus Ini
      </button>
    </div>
  );
}

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
  // "fields" tetap dipakai untuk key/render & remove/append (operasi struktural),
  // TAPI untuk update isi item yang sudah ada, kita pakai setValue (lihat updateFormula),
  // bukan method `update` bawaan useFieldArray — supaya field.id tidak berubah
  // setiap kali user memilih sesuatu di select.
  const { fields, append, remove } = useFieldArray({ control, name: "formulas" });

  const allKeys = new Set([
    ...columns.map((c) => c.field_key),
    ...documentFields.map((d) => d.field_key),
  ]);

  const lineItemInputs = columns.filter((c) => c.data_type !== "formula_output");
  const lineItemTargets = columns.filter((c) => c.data_type === "formula_output");
  const documentTargets = documentFields.filter((d) => d.kind === "computed");
  const documentLevelSources = [...columns, ...documentFields];

  // Pengganti `update()` dari useFieldArray — menulis langsung ke path tertentu
  // tanpa memicu remove+insert (jadi field.id tetap sama, tidak ada remount).
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
        setSaveError("Ada rumus dengan target field yang belum dipilih/tidak valid.");
        return;
      }
      if (!f.expression) {
        setSaveError(`Rumus untuk "${f.target_field_key}" belum lengkap.`);
        return;
      }
      const referenced = extractReferencedKeys(f.expression);
      const invalidRefs = referenced.filter((k: string) => !allKeys.has(k));
      if (invalidRefs.length > 0) {
        setSaveError(`Rumus "${f.target_field_key}" mereferensikan field tidak dikenal: ${invalidRefs.join(", ")}`);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        {fields.map((field, index) => {
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

          // scope === "document_level"
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
        })}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={addLineItemFormula} className="text-sm border rounded px-3 py-2 flex-1">
          + Rumus Baris
        </button>
        <button type="button" onClick={addDocumentLevelFormula} className="text-sm border rounded px-3 py-2 flex-1">
          + Rumus Dokumen
        </button>
      </div>

      {saveError && <p className="text-red-500 text-sm">{saveError}</p>}

      <button disabled={saving} className="bg-black text-white rounded p-2 px-4">
        {saving ? "Menyimpan..." : "Simpan Rumus"}
      </button>
    </form>
  );
}