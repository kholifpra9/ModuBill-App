import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteTemplateButton } from "./delete-template-button";
import { SetDefaultButton } from "./set-default-button";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, name, document_title, orientation, is_default, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-500">Gagal memuat template: {error.message}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Template</h1>
        <Link href="/templates/new" className="bg-black text-white rounded px-4 py-2 text-sm">
          + Buat Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="text-gray-500">
          Belum ada template. <Link href="/templates/new" className="underline">Buat yang pertama</Link>.
        </p>
      ) : (
        <div className="grid gap-3">
          {templates.map((t) => (
            <div key={t.id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {t.name} {t.is_default && <span className="text-xs bg-black text-white rounded px-2 py-0.5 ml-2">Default</span>}
                </p>
                <p className="text-sm text-gray-500">{t.document_title} — {t.orientation}</p>
              </div>
              <div className="flex gap-2">
                {!t.is_default && <SetDefaultButton templateId={t.id} />}
                <Link href={`/templates/${t.id}/columns`} className="text-sm border rounded px-3 py-1">
                    Edit Kolom
                </Link>
                <DeleteTemplateButton templateId={t.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}