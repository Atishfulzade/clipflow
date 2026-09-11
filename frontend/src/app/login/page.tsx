"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors, Globe, Mail, Lock, User, ArrowRight, Shield } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, isAuthenticated, user, checkAuth } = useAppStore();
  
  const [email, setEmail] = useState("alex@clipflow.ai");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isOnboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In handler (redirect to actual Google OAuth page)
  const handleGoogleLoginClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-client-id.apps.googleusercontent.com';
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google-callback`;
    const scope = encodeURIComponent('openid email profile');
    const responseType = 'token';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;
    window.location.href = googleAuthUrl;
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

      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
        <h2 className="text-xl font-bold text-white text-center mb-1">Welcome back</h2>
        <p className="text-zinc-500 text-sm text-center mb-6">Enter your credentials to access your workspace</p>

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

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-zinc-500" /> Password
              </label>
              <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Forgot?</Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-650 transition-colors outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 transition-all font-semibold rounded-lg text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isLoading ? "Signing in..." : "Sign In with Email"}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-zinc-900"></div>
          <span className="flex-shrink mx-4 text-zinc-500 text-xs font-medium uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-zinc-900"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLoginClick}
          className="w-full py-3 border border-zinc-800 bg-[#09090b]/40 hover:bg-zinc-950/80 transition-colors text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
