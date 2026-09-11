"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Scissors, Loader2, AlertCircle } from "lucide-react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { googleLogin, checkAuth } = useAppStore();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state") || "";

    if (state.startsWith("connect-")) {
      const parts = state.split(":");
      const platform = parts[0].replace("connect-", "");
      const userId = parts[1] || "";
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      window.location.href = `${backendUrl}/api/channels/callback/${platform}?code=${code}&state=${userId}`;
      return;
    }
    
    // Parse access_token from URL hash (Google Implicit flow redirects with hash params)
    let accessToken = "";
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      accessToken = hashParams.get("access_token") || "";
    }

    if (!code && !accessToken) {
      setErrorMsg("Authentication credentials not found. Redirecting to login...");
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }

    let isMounted = true;
    let timer: NodeJS.Timeout;

    async function exchangeCode() {
      try {
        if (accessToken) {
          await googleLogin({ accessToken });
        } else {
          await googleLogin({ code: code! });
        }
        await checkAuth();
        if (isMounted) {
          router.push("/dashboard");
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || "Google Authentication failed. Redirecting to login...");
          timer = setTimeout(() => {
            router.push("/login");
          }, 4000);
        }
      }
    }

    exchangeCode();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [searchParams, googleLogin, checkAuth, router]);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-6 relative selection:bg-violet-500/30 selection:text-violet-200">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 backdrop-blur-md shadow-2xl flex flex-col items-center text-center space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            VibeCut<span className="text-violet-500">.ai</span>
          </span>
        </div>

        {errorMsg ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-900/50 flex items-center justify-center mx-auto text-red-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Authentication Failed</h2>
            <p className="text-zinc-400 text-xs max-w-xs">{errorMsg}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white">Connecting with Google</h2>
            <p className="text-zinc-500 text-xs">Verifying credentials and setting up your workspace dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-6 text-white">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
