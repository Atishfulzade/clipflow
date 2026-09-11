"use client";

import React from "react";
import Link from "next/link";
import { Scissors, HelpCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center px-6 relative selection:bg-violet-500/30 selection:text-violet-200 font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Scissors Icon / Branding */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-white">
          VibeCut<span className="text-violet-500">.ai</span>
        </span>
      </div>

      {/* 404 Card */}
      <div className="w-full max-w-lg bg-zinc-950/60 border border-zinc-900 rounded-3xl p-10 backdrop-blur-md shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Floating question mark decoration */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto shadow-inner mb-2 animate-bounce duration-1000">
          <HelpCircle className="w-8 h-8 text-violet-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-white to-zinc-450 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-lg font-bold text-zinc-200">Page Not Found</h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            The page you are looking for doesn't exist, has been moved, or resides in a different workspace context.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-900 to-transparent w-full my-6" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 bg-white text-black hover:bg-zinc-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 border border-zinc-850 bg-[#09090b]/40 hover:bg-zinc-950/80 text-zinc-350 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
