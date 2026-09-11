"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Video, 
  Calendar, 
  BarChart3, 
  Layers, 
  Cpu, 
  ChevronDown, 
  Users, 
  Zap,
  TrendingUp,
  MessageSquare,
  Repeat,
  Scissors
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState("clips");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans antialiased overflow-hidden selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
              <Scissors className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              VibeCut<span className="text-violet-500">.ai</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-zinc-100 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-zinc-100 transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-zinc-100 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-zinc-100 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="relative group overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold bg-white text-black transition-all hover:bg-zinc-200">
              <span className="relative z-10 flex items-center gap-1.5">
                Start Free <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-semibold mb-8 shadow-inner shadow-violet-500/10"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen AI Video Editor</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent leading-[1.1] mb-6"
        >
          Turn One YouTube Video Into <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">10 Viral Shorts</span> Automatically
        </motion.h1>

        {/* Subhead */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10"
        >
          Transform long-form videos into high-retention TikToks, Reels, and YouTube Shorts with AI. Add animated captions, generate titles, schedule posts, and track performance.
        </motion.p>

        {/* Call to Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
            Start Free Now <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#demo" className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold border border-zinc-800 hover:bg-zinc-950 transition-colors flex items-center justify-center gap-2 bg-[#09090b]/40 backdrop-blur-sm">
            <Play className="w-4 h-4 text-violet-400 fill-violet-400" /> Watch Demo
          </a>
        </motion.div>

        {/* Hero Interactive App Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl rounded-2xl border border-zinc-800/80 bg-[#0c0c0e]/80 p-3 md:p-4 shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-violet-600/5 to-transparent rounded-2xl pointer-events-none" />
          <div className="rounded-xl overflow-hidden border border-zinc-900 bg-black/60 aspect-[16/9] flex flex-col">
            
            {/* Mock Dashboard Topbar */}
            <div className="h-12 border-b border-zinc-900 px-4 flex items-center justify-between bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-800" />
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-800" />
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-800" />
                <span className="text-xs text-zinc-500 ml-4 font-mono select-none">vibecut.ai/dashboard/project-12</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-zinc-400 font-semibold">AI Processor Active</span>
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="flex-1 grid grid-cols-12 gap-3 p-4">
              
              {/* Left Column - Video Source */}
              <div className="col-span-8 border border-zinc-900 rounded-lg p-3 bg-zinc-950/20 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-zinc-400">Original Long-Form Video</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono">18:45 mins</span>
                  </div>
                  <div className="aspect-video bg-zinc-900/60 rounded-md relative flex items-center justify-center overflow-hidden border border-zinc-900">
                    <div className="absolute inset-0 bg-[radial-gradient(#1f1f2e_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                    <Play className="w-12 h-12 text-violet-500 hover:scale-110 transition-transform cursor-pointer" fill="currentColor" />
                    {/* Caption Overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/85 px-4 py-1.5 rounded border border-zinc-800/80 text-xs text-center font-bold tracking-wide">
                      ⚡ THIS IS THE <span className="text-violet-400">REACT HOOK</span> YOU NEED!
                    </div>
                  </div>
                </div>
                {/* Timeline */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                    <span>0:00</span>
                    <span>9:22</span>
                    <span>18:45</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full relative overflow-hidden">
                    <div className="absolute left-[30%] right-[40%] h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full" />
                    <div className="absolute left-[30%] w-0.5 h-full bg-white z-10" />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-400 mt-1">
                    <span className="text-violet-400 font-semibold">Active Highlight Frame: 5:40 - 6:40</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Clips Generated */}
              <div className="col-span-4 border border-zinc-900 rounded-lg p-3 bg-zinc-950/20 flex flex-col gap-3">
                <div className="text-xs font-semibold text-zinc-400 flex justify-between items-center">
                  <span>Detected Clips (10)</span>
                  <span className="text-[10px] text-violet-400">Sort by Virality</span>
                </div>

                <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
                  
                  {/* Clip Item 1 */}
                  <div className="border border-violet-500/20 bg-violet-500/5 rounded-md p-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-zinc-200">#1 React Secrets Revealed</p>
                      <span className="text-[9px] text-zinc-400">Duration: 30s • Score: 98%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-600/20 text-violet-400 font-mono font-bold">Virality 98</span>
                    </div>
                  </div>

                  {/* Clip Item 2 */}
                  <div className="border border-zinc-900 bg-zinc-900/10 rounded-md p-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-300">#2 I Wish I Knew This Earlier</p>
                      <span className="text-[9px] text-zinc-500">Duration: 45s • Score: 92%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono font-bold">Virality 92</span>
                    </div>
                  </div>

                  {/* Clip Item 3 */}
                  <div className="border border-zinc-900 bg-zinc-900/10 rounded-md p-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-300">#3 Mind-Blowing Optimization</p>
                      <span className="text-[9px] text-zinc-500">Duration: 15s • Score: 87%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono font-bold">Virality 87</span>
                    </div>
                  </div>

                  {/* Clip Item 4 */}
                  <div className="border border-zinc-900 bg-zinc-900/10 rounded-md p-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-300">#4 Avoid This Big Bug</p>
                      <span className="text-[9px] text-zinc-500">Duration: 59s • Score: 81%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono font-bold">Virality 81</span>
                    </div>
                  </div>

                </div>
                
                <button className="w-full py-2 bg-violet-600 hover:bg-violet-700 transition-colors text-white font-semibold rounded text-xs flex items-center justify-center gap-1.5">
                  Export Selected Clips <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      </section>

      {/* Tool Replacement Section */}
      <section className="border-y border-zinc-900 bg-zinc-950/20 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8">ONE WORKFLOW TOOL TO REPLACE ALL SUBSCRIPTIONS</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12 items-center justify-center text-center">
            <div className="text-zinc-600 font-bold text-lg select-none">OpusClip ❌</div>
            <div className="text-zinc-600 font-bold text-lg select-none">Buffer ❌</div>
            <div className="text-zinc-600 font-bold text-lg select-none">Hootsuite ❌</div>
            <div className="text-zinc-600 font-bold text-lg select-none">CapCut ❌</div>
            <div className="text-zinc-600 font-bold text-lg select-none">ChatGPT ❌</div>
            <div className="text-violet-500 font-bold text-lg tracking-tight select-none">VibeCut AI ✅</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4">
            Everything You Need To Dominate Social Media
          </h2>
          <p className="text-zinc-400 text-lg">
            Stop managing five different tools. VibeCut automates clip extraction, editing, title creation, publishing, and analytics in one unified dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all hover:bg-zinc-950/50 group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Hook Detection</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our AI extracts high-engagement moments, hooks, funny segments, and controversial topics, scoring each clip's virality potential instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all hover:bg-zinc-950/50 group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Emoji Captions</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Generate animated auto-caption subtitles synced with voice. Customize styles, fonts, highlights, and matching emojis.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all hover:bg-zinc-950/50 group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Omnichannel Calendar</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Schedule your posts dynamically using a calendar board. Drag and drop clips to plan content distribution to all channels.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all hover:bg-zinc-950/50 group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Channel Coach</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Analyze channel metrics, audience retention, drop-offs, and receive direct coaching recommendations via chat.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all hover:bg-zinc-950/50 group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Full Content Repurposing</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Turn one long-form video into a newsletter, blog post, 10-tweet thread, LinkedIn post, and Instagram carousel automatically.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 transition-all hover:bg-zinc-950/50 group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Track views, watch time, shares, comments, and engagement rates across all linked creator profiles in a unified graph.
            </p>
          </div>

        </div>
      </section>

      {/* How it works workflow */}
      <section id="workflow" className="py-24 px-6 bg-zinc-950/20 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4">
              Viral Flow in 3 Steps
            </h2>
            <p className="text-zinc-400 text-lg">
              Creating high-performing shorts has never been this simple. Paste your link, style your clips, and hit publish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Paste Link or Upload</h3>
              <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                Paste any YouTube URL or drop an MP4 file. Supports bulk import if you want to repurpose library videos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Split & Subtitle</h3>
              <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                AI transcribes your video, identifies the top 10 hooks, adds animated emoji captions, and formats layout to 9:16.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Publish or Schedule</h3>
              <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                Review suggested viral titles, generate tags, and queue publishing to TikTok, Reels, Shorts, and X automatically.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-zinc-400 text-lg">
            Choose the plan that fits your posting schedule. Cancel or upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          
          {/* Plan 1 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/20 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-zinc-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>3 videos/month limit</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>AI clip detection</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Standard subtitle templates</span>
                </li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 border border-zinc-800 hover:bg-zinc-900 transition-colors text-center text-sm font-semibold rounded-xl text-white">
              Get Started
            </Link>
          </div>

          {/* Plan 2 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/20 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">Creator</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$19</span>
                <span className="text-zinc-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>100 videos/month</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Premium caption themes</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Social media scheduling</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>AI title & tag generation</span>
                </li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 border border-zinc-800 hover:bg-zinc-900 transition-colors text-center text-sm font-semibold rounded-xl text-white">
              Choose Creator
            </Link>
          </div>

          {/* Plan 3 - Most Popular */}
          <div className="p-8 rounded-2xl border border-violet-500 bg-violet-950/5 flex flex-col justify-between relative shadow-lg shadow-violet-500/5">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-zinc-400 text-sm">/month</span>
              </div>
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-2.5 text-zinc-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Unlimited videos</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Custom brand kits</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>AI Channel Coach integration</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>10-format repurposing engine</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Priority rendering pipeline</span>
                </li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 bg-violet-600 hover:bg-violet-700 transition-colors text-center text-sm font-semibold rounded-xl text-white">
              Choose Pro
            </Link>
          </div>

          {/* Plan 4 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/20 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">Agency</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$99</span>
                <span className="text-zinc-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Team collaboration (10 members)</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Dedicated asset storage</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>Custom Watermarking</span>
                </li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 border border-zinc-800 hover:bg-zinc-900 transition-colors text-center text-sm font-semibold rounded-xl text-white">
              Choose Agency
            </Link>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-zinc-950/20 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400">
              Clear up any doubts you have about our features, payments, or transcription services.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does the AI select viral clips?",
                a: "Our algorithm transcribes the video using Whisper API, performs syntactic and semantic parsing, analyzes the context flow for hooks, pacing spikes, and topics of interest (educational, funny, controversial), and scores clips using comparative datasets of viral short-form media."
              },
              {
                q: "Is there a limit to the length of YouTube videos I can import?",
                a: "Free users can import videos up to 20 minutes long. Pro and Agency users can import videos up to 3 hours long. Supports URLs, bulk imports, and direct MP4 uploads."
              },
              {
                q: "Can I customize the subtitle styles and emojis?",
                a: "Yes. Our Content Editor supports custom font selection, glowing borders, active-word scaling animations, emoji position syncing, and custom brand kit watermarks that automatically apply to every export."
              },
              {
                q: "Which social media platforms are supported for scheduling?",
                a: "VibeCut directly integrates with YouTube Shorts, Instagram Reels, TikTok, LinkedIn, Facebook, and X (Twitter). You can draft, schedule, and review post statuses from a monthly calendar view."
              },
              {
                q: "Can I manage projects with my team?",
                a: "Yes! The Agency plan includes our Team Workspace, which supports roles such as Owner, Editor, Manager, and Client with customizable feature permissions and invite links."
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="border border-zinc-850 rounded-xl bg-zinc-900/10 overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between font-semibold text-white focus:outline-none"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-violet-400' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="p-6 pt-0 border-t border-zinc-850 text-sm text-zinc-400 leading-relaxed bg-[#0c0c0e]/30">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
              <Scissors className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">VibeCut AI</span>
          </div>
          
          <div className="flex gap-8">
            <a href="#features" className="hover:text-zinc-300 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
          </div>

          <div>
            © 2026 VibeCut AI Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
