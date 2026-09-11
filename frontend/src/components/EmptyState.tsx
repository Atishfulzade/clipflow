"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, description, icon: Icon, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-900 bg-zinc-950/10 rounded-2xl min-h-[300px] w-full">
      <div className="w-12 h-12 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center justify-center text-zinc-400 mb-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent" />
        <Icon className="w-5.5 h-5.5 text-zinc-400 relative z-10 animate-[float_3s_ease-in-out_infinite]" />
      </div>
      <h3 className="text-sm font-bold text-white tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-zinc-550 max-w-xs mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-violet-900/10"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
