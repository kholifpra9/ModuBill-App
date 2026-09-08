"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

    async function onSubmit(data: RegisterInput) {
        const { data: signUpData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
        });

        if (error) {
            setError("email", { message: error.message });
            return;
        }

        if (signUpData.user) {
            const { error: profileError } = await supabase.from("profiles").insert({
            id: signUpData.user.id,
            business_name: data.businessName,
            });

            if (profileError) console.error("Gagal buat profile:", profileError);
        }

        router.push("/settings"); // sementara, sampai /templates ada
        router.refresh();
    }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto mt-16 space-y-4">
      <h1 className="text-xl font-semibold">Daftar ModuBill</h1>

      <div>
        <input {...register("businessName")} placeholder="Nama Bisnis" className="w-full border rounded p-2" />
        {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName.message}</p>}
      </div>

      <div>
        <input {...register("email")} type="email" placeholder="Email" className="w-full border rounded p-2" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <input {...register("password")} type="password" placeholder="Password" className="w-full border rounded p-2" />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <div>
        <input {...register("confirmPassword")} type="password" placeholder="Konfirmasi Password" className="w-full border rounded p-2" />
        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
      </div>

      <button disabled={isSubmitting} className="w-full bg-black text-white rounded p-2">
        {isSubmitting ? "Memproses..." : "Daftar"}
      </button>
    </form>
  );
}