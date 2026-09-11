"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MessageSquare, Send, Sparkles, AlertCircle, TrendingUp, Lightbulb } from "lucide-react";

export default function CoachPage() {
  const { coachMessages, sendCoachMessage } = useAppStore();
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendCoachMessage(inputText);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">AI Channel Coach</h1>
        <p className="text-zinc-500 text-sm mt-1">Chat with your AI advisor trained on retention graphs, hook metrics, and competitor channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Chat Feed Panel (Span 8) */}
        <div className="lg:col-span-8 border border-zinc-900 bg-zinc-950/20 rounded-2xl p-6 h-[500px] flex flex-col justify-between">
          
          {/* Messages Scroll feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
            {coachMessages.map((msg) => {
              const isCoach = msg.sender === 'coach';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isCoach ? "self-start" : "ml-auto flex-row-reverse"}`}
                >
                  {isCoach ? (
                    <div className="w-8 h-8 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs flex-shrink-0">
                      AC
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isCoach 
                      ? "bg-zinc-900/40 border border-zinc-900 text-zinc-300 rounded-tl-none" 
                      : "bg-violet-600 text-white rounded-tr-none"
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="text-[9px] text-zinc-500 mt-2 block text-right font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 self-start max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 text-zinc-500 text-xs rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-zinc-900">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask: Why are my views dropping? or Suggest content ideas..."
              className="flex-1 bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold rounded-lg text-xs flex items-center justify-center transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right Info Panel (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-violet-400" /> Channel Diagnostics
            </h3>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="text-zinc-300">Hook drop-offs on YouTube: 68% leave in first 3s</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="text-zinc-300">TikTok video posting gap: 4 days since last post</span>
              </div>
            </div>
          </div>

          <div className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-violet-400" /> Suggested Questions
            </h3>
            <div className="space-y-2 pt-2">
              <button 
                onClick={() => setInputText("Why are my views dropping on YouTube Shorts?")}
                className="w-full text-left p-2.5 rounded-lg bg-zinc-900/10 border border-zinc-900 hover:border-zinc-800 text-xs text-zinc-300 transition-colors"
              >
                "Why are my views dropping?"
              </button>
              <button 
                onClick={() => setInputText("Can you give me 3 high-impact content ideas for software development?")}
                className="w-full text-left p-2.5 rounded-lg bg-zinc-900/10 border border-zinc-900 hover:border-zinc-800 text-xs text-zinc-300 transition-colors"
              >
                "Give me content ideas in tech"
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
