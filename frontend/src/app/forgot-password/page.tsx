"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scissors, Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAppStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to request password reset.");
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

      {/* Forgot Password Card */}
      <div className="w-full max-w-md bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
        {isSuccess ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/20 border border-emerald-900/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Reset link sent</h2>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              If an account is associated with <span className="text-white font-semibold">{email}</span>, we've sent instructions to reset your password.
            </p>
            <div className="pt-4">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white text-center mb-1">Recover account</h2>
            <p className="text-zinc-505 text-zinc-500 text-xs text-center mb-6 leading-relaxed">
              Enter your email address and we'll send you a secure link to reset your password.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/20 border border-red-900/50 text-red-400 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" /> Email address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 transition-colors outline-none"
                  placeholder="name@example.com"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 transition-all font-semibold rounded-lg text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoading ? "Sending Link..." : "Send Reset Link"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center text-xs text-zinc-500 mt-6">
              Remember your password?{" "}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
