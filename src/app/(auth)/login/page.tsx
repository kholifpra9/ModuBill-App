"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword(data);
    
    if (error) {
      setError("password", { message: "Email atau password yang dimasukkan salah." });
      return;
    }

    router.push("/");
    router.refresh(); // Penting: refresh server component agar session ter-detect
  }

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="text-center sm:text-left space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Selamat Datang Kembali
        </h1>
        <p className="text-sm text-slate-500">
          Masuk ke akun ModuBill Anda untuk mengelola transaksi.
        </p>
      </div>

      {/* Global Error Alert Banner */}
      {errors.root && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
          <span>{errors.root.message}</span>
        </div>
      )}

      {/* Form Input */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-300 focus:ring-red-500 bg-red-50/30"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field with Eye Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-300 focus:ring-red-500 bg-red-50/30"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {isSubmitting ? (
            <span>Memproses...</span>
          ) : (
            <>
              <LogIn size={18} />
              <span>Masuk</span>
            </>
          )}
        </button>

      </form>

      {/* Switch to Register */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Daftar Gratis Sekarang
          </Link>
        </p>
      </div>

    </div>
  );
}