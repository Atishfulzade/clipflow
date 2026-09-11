"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, checkAuth, isAuthenticated, isLoadingUser, user } = useAppStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoadingUser, isAuthenticated, router]);
  
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("");

  const niches = [
    { id: "podcast", label: "Podcast & Interviews", emoji: "🎙️" },
    { id: "tech", label: "Tech & Coding", emoji: "💻" },
    { id: "gaming", label: "Gaming Highlights", emoji: "🎮" },
    { id: "finance", label: "Finance & Business", emoji: "📈" },
    { id: "vlog", label: "Vlogging & Lifestyle", emoji: "📸" },
    { id: "edu", label: "Educational & Science", emoji: "🧠" },
    { id: "other", label: "Other Niche", emoji: "✨" }
  ];

  const socialPlatforms = [
    { id: "youtube", label: "YouTube Shorts", color: "text-red-500" },
    { id: "tiktok", label: "TikTok Clips", color: "text-pink-400" },
    { id: "instagram", label: "Instagram Reels", color: "text-purple-400" },
    { id: "linkedin", label: "LinkedIn Posts", color: "text-blue-400" },
    { id: "x", label: "X / Twitter", color: "text-white" }
  ];

  const frequencies = [
    { id: "daily", label: "Daily (7 posts / week)" },
    { id: "multi", label: "3-4 times a week" },
    { id: "weekly", label: "Once a week" },
    { id: "flexible", label: "Just trying it out" }
  ];

  const togglePlatform = (id: string) => {
    setPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      completeOnboarding(niche, platforms, frequency);
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !niche) return true;
    if (step === 2 && platforms.length === 0) return true;
    if (step === 3 && !frequency) return true;
    return false;
  };

  // Sliding transitions for wizard
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400 font-medium">Loading workspace session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Let the redirect effect run
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center px-6 relative selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Progress Dots */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s === step 
                ? "w-8 bg-violet-500" 
                : s < step 
                  ? "w-2 bg-violet-800" 
                  : "w-2 bg-zinc-800"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-lg bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative">
        
        {/* Step Indicator */}
        <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 block mb-2">
          Step {step} of 3
        </span>

        <div className="min-h-[280px] flex flex-col justify-between">
          
          {/* Animated Wizard Content */}
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    What is your creator niche? <Sparkles className="w-4 h-4 text-violet-400" />
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">This helps us customize viral hooks tailored to your industry.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {niches.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setNiche(n.id)}
                      className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        niche === n.id 
                          ? "border-violet-500 bg-violet-500/10 text-white shadow-lg shadow-violet-500/5" 
                          : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xl">{n.emoji}</span>
                      <span className="font-semibold text-sm">{n.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-white">Which platforms do you publish on?</h2>
                  <p className="text-zinc-500 text-sm mt-1">Select all channels where you want to schedule and track clips.</p>
                </div>

                <div className="space-y-2">
                  {socialPlatforms.map((p) => {
                    const isSelected = platforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected 
                            ? "border-violet-500 bg-violet-500/10 text-white" 
                            : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <span className="font-semibold text-sm">{p.label}</span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-zinc-800" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-white">How often do you post?</h2>
                  <p className="text-zinc-500 text-sm mt-1">We will pre-populate your content calendar schedule template accordingly.</p>
                </div>

                <div className="space-y-2">
                  {frequencies.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFrequency(f.id)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                        frequency === f.id 
                          ? "border-violet-500 bg-violet-500/10 text-white" 
                          : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span className="font-semibold text-sm">{f.label}</span>
                      {frequency === f.id ? (
                        <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-800" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-900">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white font-semibold rounded-lg text-sm flex items-center gap-1.5 transition-all"
            >
              {step === 3 ? "Complete" : "Next"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
