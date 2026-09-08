"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      setError("password", { message: "Email atau password salah" });
      return;
    }
    router.push("/");
    router.refresh(); // penting: refresh server component agar session ke-detect
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto mt-16 space-y-4">
      <h1 className="text-xl font-semibold">Masuk ModuBill</h1>
      <div>
        <input {...register("email")} type="email" placeholder="Email" className="w-full border rounded p-2" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <input {...register("password")} type="password" placeholder="Password" className="w-full border rounded p-2" />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>
      <button disabled={isSubmitting} className="w-full bg-black text-white rounded p-2">
        {isSubmitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}