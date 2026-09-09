"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SetDefaultButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSetDefault() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Step 1: unset default lama (kalau ada)
    await supabase
      .from("templates")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);

    // Step 2: set default baru
    const { error } = await supabase
      .from("templates")
      .update({ is_default: true })
      .eq("id", templateId);

    setLoading(false);
    if (!error) router.refresh();
  }

  return (
    <button
      onClick={handleSetDefault}
      disabled={loading}
      className="text-sm text-gray-500 hover:text-black border rounded px-3 py-1"
    >
      Jadikan Default
    </button>
  );
}