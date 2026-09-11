"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-[calc(100%-2.5rem)] sm:w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = "bg-zinc-950/90 border-zinc-800/80 text-white";
          let Icon = Info;
          let iconColor = "text-sky-400";

          if (toast.type === "SUCCESS") {
            bgColor = "bg-emerald-950/60 border-emerald-500/20 text-emerald-50";
            Icon = CheckCircle;
            iconColor = "text-emerald-400";
          } else if (toast.type === "ERROR") {
            bgColor = "bg-rose-950/60 border-rose-500/20 text-rose-50";
            Icon = AlertCircle;
            iconColor = "text-rose-400";
          } else if (toast.type === "WARNING") {
            bgColor = "bg-amber-950/60 border-amber-500/20 text-amber-50";
            Icon = AlertTriangle;
            iconColor = "text-amber-400";
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              layout
              className={`p-3.5 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 justify-between ${bgColor}`}
            >
              <div className="flex gap-2.5 items-start">
                <Icon className={`w-4.5 h-4.5 shrink-0 ${iconColor} mt-0.5`} />
                <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-white transition-colors shrink-0 p-0.5 hover:bg-zinc-800/50 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
