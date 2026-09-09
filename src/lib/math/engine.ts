import { create, all } from "mathjs";
import type { TemplateFormula } from "@/lib/schemas/template";

// Instance mathjs standar. KITA TIDAK mencoba "mematikan" fungsi bawaan
// (evaluate/parse/compile/createUnit dst) dengan override — nama-nama itu
// adalah method ASLI di objek `math` ini sendiri, jadi menimpanya balik
// akan merusak mathjs dari dalam (evaluate() manggil parse() secara
// internal, saling bergantung). Keamanan dijamin dengan cara yang lebih
// tepat di evaluateExpression() di bawah: whitelist berbasis `scope`,
// bukan blacklist nama fungsi.
const math = create(all, {});

math.import(
  {
    SUM: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
    AVG: (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  },
  { override: true }
);

const AGGREGATE_FN_NAMES = new Set(["SUM", "AVG"]);

/**
 * Ekstrak semua identifier (nama field_key / nama fungsi) yang muncul di
 * dalam sebuah ekspresi.
 */
export function extractReferencedKeys(expression: string): string[] {
  const tokens = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) ?? [];
  return tokens.filter((t) => !AGGREGATE_FN_NAMES.has(t));
}

/**
 * Evaluasi satu ekspresi rumus dengan scope terbatas. Tidak pernah pakai
 * eval() JS asli.
 *
 * Guard keamanan: SETIAP identifier di ekspresi wajib ada sebagai key di
 * `scope` (field_key yang benar-benar disediakan pemanggil). Kalau ada
 * identifier yang tidak dikenal — termasuk nama fungsi mathjs apapun
 * seperti evaluate/parse/import — ditolak DI SINI, sebelum mathjs sempat
 * mengeksekusi apapun. Ini otomatis mem-block pemanggilan fungsi
 * berbahaya tanpa perlu daftar blacklist nama fungsi yang rapuh.
 */
export function evaluateExpression(
  expression: string,
  scope: Record<string, number | number[]>
): number {
  const referenced = extractReferencedKeys(expression);
  const unknown = referenced.filter((key) => !(key in scope));
  if (unknown.length > 0) {
    throw new Error(
      `Ekspresi mereferensikan identifier yang tidak dikenal: ${unknown.join(", ")}`
    );
  }

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