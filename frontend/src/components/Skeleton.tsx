"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rectangle" | "card";
}

export default function Skeleton({ className = "", variant = "rectangle" }: SkeletonProps) {
  let baseStyle = "animate-pulse bg-zinc-900 border border-zinc-905/30";
  
  if (variant === "text") {
    baseStyle += " h-3 w-3/4 rounded";
  } else if (variant === "circle") {
    baseStyle += " rounded-full";
  } else if (variant === "card") {
    baseStyle += " rounded-2xl h-40 w-full";
  } else {
    baseStyle += " rounded-lg";
  }

  return (
    <div className={`${baseStyle} ${className}`}>
      {/* Dynamic diagonal shimmer ray overlay */}
      <div className="w-full h-full relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
}
