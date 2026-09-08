import { create, all } from "mathjs";
import type { TemplateFormula } from "@/lib/schemas/template";

// Instance mathjs TERBATAS — hanya fungsi aritmatika dasar + agregasi.
// Fungsi berbahaya (import, createUnit, akses ke lingkungan JS) TIDAK di-import.
const math = create(all, {});

// Nonaktifkan fungsi-fungsi yang tidak relevan/berpotensi disalahgunakan.
const DISABLED_FUNCTIONS = ["import", "createUnit", "evaluate", "parse", "simplify"];
for (const fn of DISABLED_FUNCTIONS) {
  math.import(
    {
      [fn]: () => {
        throw new Error(`Fungsi "${fn}" tidak diizinkan di ModuBill formula engine`);
      },
    },
    { override: true }
  );
}

// Fungsi agregasi custom yang boleh dipakai di document_level formula.
math.import(
  {
    SUM: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
    AVG: (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  },
  { override: true }
);

/**
 * Evaluasi satu ekspresi rumus dengan scope terbatas (HANYA field_key
 * yang tersedia di baris/dokumen ini). Tidak pernah pakai eval() JS asli.
 */
export function evaluateExpression(
  expression: string,
  scope: Record<string, number | number[]>
): number {
  const result = math.evaluate(expression, scope);
  if (typeof result !== "number" || Number.isNaN(result)) {
    throw new Error(`Hasil evaluasi "${expression}" bukan angka valid`);
  }
  return result;
}

/**
 * Urutkan formula berdasarkan dependency (topological sort sederhana),
 * supaya formula yang butuh hasil formula lain dijalankan belakangan.
 * Contoh: grand_total butuh subtotal → subtotal harus dihitung dulu.
 */
export function sortFormulasByDependency(
  formulas: TemplateFormula[]
): TemplateFormula[] {
  const targetKeys = new Set(formulas.map((f) => f.target_field_key));
  const sorted: TemplateFormula[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function extractReferencedKeys(expression: string): string[] {
    return expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) ?? [];
  }

  function visit(formula: TemplateFormula) {
    if (visited.has(formula.target_field_key)) return;
    if (visiting.has(formula.target_field_key)) {
      throw new Error(
        `Circular dependency terdeteksi pada field_key "${formula.target_field_key}"`
      );
    }
    visiting.add(formula.target_field_key);

    const referencedKeys = extractReferencedKeys(formula.expression);
    for (const key of referencedKeys) {
      if (targetKeys.has(key) && key !== formula.target_field_key) {
        const dependency = formulas.find((f) => f.target_field_key === key);
        if (dependency) visit(dependency);
      }
    }

    visiting.delete(formula.target_field_key);
    visited.add(formula.target_field_key);
    sorted.push(formula);
  }

  for (const formula of formulas) visit(formula);
  return sorted;
}

/**
 * Pipeline lengkap document_level: jalankan semua formula sesuai urutan
 * dependency, hasilnya langsung ditambahkan ke scope agar formula
 * berikutnya bisa memakainya.
 */
export function runDocumentLevelFormulas(
  formulas: TemplateFormula[],
  initialScope: Record<string, number | number[]>
): Record<string, number> {
  const ordered = sortFormulasByDependency(
    formulas.filter((f) => f.scope === "document_level")
  );
  const scope = { ...initialScope };
  const results: Record<string, number> = {};

  for (const formula of ordered) {
    const value = evaluateExpression(formula.expression, scope);
    scope[formula.target_field_key] = value;
    results[formula.target_field_key] = value;
  }

  return results;
}
