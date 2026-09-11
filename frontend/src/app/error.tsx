"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Scissors, AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error("Application runtime exception caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center px-6 relative selection:bg-violet-500/30 selection:text-violet-200 font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-950/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Scissors Icon / Branding */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-white">
          VibeCut<span className="text-violet-500">.ai</span>
        </span>
      </div>

      {/* Error Card */}
      <div className="w-full max-w-lg bg-zinc-950/60 border border-zinc-900 rounded-3xl p-10 backdrop-blur-md shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Error icon decoration */}
        <div className="w-16 h-16 rounded-2xl bg-red-950/10 border border-red-900/30 flex items-center justify-center mx-auto shadow-lg mb-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Something went wrong
          </h1>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            A critical exception was caught during runtime. The system has isolated the segment to prevent data loss.
          </p>
        </div>

        {/* Display Error Message (Sanitized/Friendly) */}
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl text-left">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Error Log Details</span>
          <p className="text-xs font-mono text-red-400/90 break-all leading-relaxed">
            {error.message || "An unexpected application error occurred."}
          </p>
          {error.digest && (
            <span className="text-[9px] font-mono text-zinc-650 mt-2 block">
              Digest signature: {error.digest}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-900 to-transparent w-full my-6" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 bg-white text-black hover:bg-zinc-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 border border-zinc-850 bg-[#09090b]/40 hover:bg-zinc-950/80 text-zinc-350 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
