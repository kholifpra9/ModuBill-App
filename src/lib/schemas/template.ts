import { z } from "zod";

// Batasan sesuai keputusan arsitektur: target skala kecil
// enterprise dengan ratusan kolom.
export const MAX_COLUMNS_PER_TEMPLATE = 20;
export const MAX_FORMULAS_PER_TEMPLATE = 20;
export const MAX_DOCUMENT_FIELDS_PER_TEMPLATE = 20;

export const dataTypeEnum = z.enum([
  "text",
  "number",
  "currency",
  "percentage",
  "formula_output",
]);

export const orientationEnum = z.enum([
  "portrait_58mm",
  "portrait_80mm",
  "landscape_a4",
  "landscape_letter",
]);

// Field per-baris (tabel item) — lihat lib/schemas/template.ts §columns_schema
export const templateColumnSchema = z.object({
  field_key: z.string().regex(/^field_\d+$/, "field_key harus format field_N"),
  label: z.string().min(1).max(50),
  data_type: dataTypeEnum,
  is_calculated: z.boolean(),
  display_order: z.number().int().nonnegative(),
});

// Field per-dokumen (ringkasan: subtotal, diskon, pajak, grand total, kembalian)
export const documentFieldSchema = z.object({
  field_key: z.string().min(1).max(50),
  label: z.string().min(1).max(50),
  kind: z.enum(["input", "computed"]),
  data_type: dataTypeEnum,
});

export const formulaScopeEnum = z.enum(["line_item", "document_level"]);

// Whitelist karakter ekspresi: field_key, angka, operator +-*/%, kurung,
// koma (untuk fungsi seperti SUM(a, b)), huruf kapital untuk nama fungsi agregat.
const SAFE_EXPRESSION_REGEX = /^[a-zA-Z0-9_ .()+\-*/%,]+$/;

export const templateFormulaSchema = z.object({
  target_field_key: z.string().min(1).max(50),
  scope: formulaScopeEnum,
  expression: z
    .string()
    .min(1)
    .max(200)
    .regex(SAFE_EXPRESSION_REGEX, "Ekspresi mengandung karakter yang tidak diizinkan"),
});

export const templateSchema = z
  .object({
    name: z.string().min(1).max(100),
    document_title: z.string().min(1).max(100),
    orientation: orientationEnum,
    notes: z.string().max(500).optional(),
    footer: z.string().max(500).optional(),
    is_default: z.boolean().default(false),
    columns_schema: z.array(templateColumnSchema).max(MAX_COLUMNS_PER_TEMPLATE),
    document_fields: z
      .array(documentFieldSchema)
      .max(MAX_DOCUMENT_FIELDS_PER_TEMPLATE),
    formulas_schema: z.array(templateFormulaSchema).max(MAX_FORMULAS_PER_TEMPLATE),
  })
  .superRefine((data, ctx) => {
    // field_key harus unik LINTAS columns_schema + document_fields,
    // karena keduanya berbagi satu namespace variable di math engine.
    const allKeys = [
      ...data.columns_schema.map((c) => c.field_key),
      ...data.document_fields.map((d) => d.field_key),
    ];
    const seen = new Set<string>();
    for (const key of allKeys) {
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `field_key "${key}" duplikat antara columns_schema dan document_fields`,
        });
      }
      seen.add(key);
    }

    // target_field_key formula harus merujuk ke field_key yang benar-benar ada
    for (const formula of data.formulas_schema) {
      if (!seen.has(formula.target_field_key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `target_field_key "${formula.target_field_key}" tidak ditemukan di columns_schema/document_fields`,
        });
      }
    }
  });

export type TemplateColumn = z.infer<typeof templateColumnSchema>;
export type DocumentField = z.infer<typeof documentFieldSchema>;
export type TemplateFormula = z.infer<typeof templateFormulaSchema>;
export type Template = z.infer<typeof templateSchema>;
