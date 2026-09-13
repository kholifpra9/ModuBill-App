"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Anda telah berhasil logout.");
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-black">
      Logout
    </button>
  );
}