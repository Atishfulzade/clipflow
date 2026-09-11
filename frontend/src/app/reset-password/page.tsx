"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Scissors, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAppStore();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) {
      setToken(t);
    } else {
      setErrorMsg("Invalid or missing reset token. Redirecting to login...");
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. The link might be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-6 relative selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group mb-8">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-white">
          VibeCut<span className="text-violet-500">.ai</span>
        </span>
      </Link>

      {/* Reset Password Card */}
      <div className="w-full max-w-md bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
        {isSuccess ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/20 border border-emerald-900/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Password updated</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Your password has been successfully updated. Redirecting you to login...
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white text-center mb-1">Set new password</h2>
            <p className="text-zinc-500 text-xs text-center mb-6 leading-relaxed">
              Please enter your new password below.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/20 border border-red-900/50 text-red-400 text-xs font-semibold text-center flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" /> New Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-700 transition-colors outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" /> Confirm New Password
                </label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-700 transition-colors outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading || !token}
                className="w-full py-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 transition-all font-semibold rounded-lg text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-6 text-white">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
