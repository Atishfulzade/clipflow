"use client";

import React, { useState } from "react";
import { Sparkles, MessageSquare, BookOpen, Flame, Compass, RefreshCw, Check, ArrowRight, Lightbulb } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function ContentStudioPage() {
  const { videos } = useAppStore();
  const [studioTab, setStudioTab] = useState<"script" | "ideas" | "comment" | "trends">("script");
  
  // Scripts state
  const [topic, setTopic] = useState("React Server Components vs WebSockets");
  const [tone, setTone] = useState("controversial");
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Comments state
  const [pastedComment, setPastedComment] = useState(
    "Can you make a video explaining why my Prisma connection pool keeps timed out on Serverless functions?"
  );
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [isProcessingComment, setIsProcessingComment] = useState(false);

  const generateScript = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingScript(true);
    
    setTimeout(() => {
      setGeneratedScript({
        hook: "🚨 STOP putting your WebSockets inside React Server Components! It is killing your server load...",
        body: "Everyone is trying to stream real-time data using custom hook connections, but Server Components are meant to execute ONCE. For real-time updates, you should be streaming data chunks or offloading to a client-side layout connection wrapper. Here is how you do it...",
        cta: "Drop a comment if you want the full source code setup!",
        titles: [
          "WebSockets in Next.js is BROKEN? 😱",
          "Stop making this RSC database mistake",
          "Real-time React Server Components solved"
        ]
      });
      setIsGeneratingScript(false);
    }, 1500);
  };

  const processComment = () => {
    setIsProcessingComment(true);
    setTimeout(() => {
      setGeneratedIdeas([
        "Prisma Connection Pooling Bottleneck Explained (Script outline)",
        "Why Serverless kills database connections (Hook)",
        "5 steps to fix Prisma timeout in Vercel (Short script)",
        "Accelerate DB connection pools: Prisma Accelerate overview"
      ]);
      setIsProcessingComment(false);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Content Studio</h1>
        <p className="text-zinc-500 text-sm mt-1">Generate viral scripts, turn audience comments into content, and browse trending creator topics.</p>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-2 border-b border-zinc-900 pb-4 overflow-x-auto">
        {[
          { id: "script", label: "Script Generator", icon: BookOpen },
          { id: "ideas", label: "30-Day Content Planner", icon: Lightbulb },
          { id: "comment", label: "Comment to Content", icon: MessageSquare },
          { id: "trends", label: "Trend Explorer", icon: Flame }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStudioTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              studioTab === tab.id 
                ? "bg-zinc-900 text-white border border-zinc-800" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-2">
        {/* Script Generator */}
        {studioTab === "script" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <form onSubmit={generateScript} className="lg:col-span-5 p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Configure Script Parameters</h3>
              
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Niche Topic</label>
                <input 
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Next.js vs Remix performance"
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Style / Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="controversial">Controversial / Hooky</option>
                  <option value="educational">Educational & Clear</option>
                  <option value="funny">Humorous & Relaxed</option>
                  <option value="inspirational">Storytelling / Motivational</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isGeneratingScript}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5"
              >
                {isGeneratingScript ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate Script Outline
              </button>
            </form>

            <div className="lg:col-span-7">
              {generatedScript ? (
                <div className="p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-6">
                  
                  <div>
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">🔥 High Retention Hook</h4>
                    <p className="text-sm font-bold text-white leading-relaxed p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl">
                      {generatedScript.hook}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">📝 Body Script</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line p-3 bg-zinc-900/10 border border-zinc-900 rounded-xl">
                      {generatedScript.body}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">🎯 Call to Action</h4>
                      <p className="text-xs text-zinc-300 p-3 bg-zinc-900/10 border border-zinc-900 rounded-xl">
                        {generatedScript.cta}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Suggested Titles</h4>
                      <ul className="text-xs text-zinc-300 space-y-1.5">
                        {generatedScript.titles.map((t: string, i: number) => (
                          <li key={i} className="truncate">• {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-72 border border-dashed border-zinc-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-zinc-900/5">
                  <BookOpen className="w-12 h-12 text-zinc-700 mb-3" />
                  <h3 className="text-sm font-semibold text-zinc-400">Ready to write</h3>
                  <p className="text-xs text-zinc-550 max-w-xs mt-1">Enter a niche topic on the left and choose a tone to generate optimized hooks and scripts.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 30-day Content Planner */}
        {studioTab === "ideas" && (
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">30-Day Viral Creator Planner</h3>
            <p className="text-zinc-500 text-xs mb-6">A pre-constructed daily hook calendar based on top engagement metrics in your niche.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { day: "Day 1", type: "Hook", text: "Nobody talks about this connection bottleneck..." },
                { day: "Day 2", type: "Tutorial", text: "How to compile Next.js 15 apps with Turbopack." },
                { day: "Day 3", type: "Tips", text: "3 productivity tricks I use inside Neovim daily." },
                { day: "Day 4", type: "Warning", text: "Stop using this package or get hacked." },
                { day: "Day 5", type: "Story", text: "How I grew my SaaS to $10k/mo in 6 months." },
                { day: "Day 6", type: "Tool Highlight", text: "The database Client you need to try." }
              ].map((item, idx) => (
                <div key={idx} className="p-4 border border-zinc-900 bg-[#09090b]/40 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-violet-400 font-mono">{item.day}</span>
                    <span className="px-1.5 py-0.2 bg-zinc-900 text-zinc-400 rounded uppercase">{item.type}</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-200">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comment to Content */}
        {studioTab === "comment" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-5 p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Comments Transformer</h3>
              <p className="text-zinc-500 text-xs mb-4">Paste any comment left by your audience on YouTube or TikTok to formulate responses.</p>
              
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Paste Audience Comment</label>
                <textarea 
                  value={pastedComment}
                  onChange={(e) => setPastedComment(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg p-3 text-xs text-white outline-none"
                />
              </div>

              <button 
                onClick={processComment}
                disabled={isProcessingComment || !pastedComment}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5"
              >
                {isProcessingComment ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                Convert to Video Concepts
              </button>
            </div>

            <div className="lg:col-span-7">
              {generatedIdeas.length > 0 ? (
                <div className="p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-white mb-2">Generated Video Concepts</h4>
                  <div className="space-y-3">
                    {generatedIdeas.map((idea, idx) => (
                      <div key={idx} className="p-3 border border-zinc-900 bg-[#09090b]/40 rounded-xl flex items-center justify-between">
                        <span className="text-xs text-zinc-200">{idea}</span>
                        <button className="text-[10px] text-violet-400 font-bold hover:underline flex items-center gap-1">
                          Draft Script <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-72 border border-dashed border-zinc-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-zinc-900/5">
                  <MessageSquare className="w-12 h-12 text-zinc-700 mb-3" />
                  <h3 className="text-sm font-semibold text-zinc-400">Waiting for comment</h3>
                  <p className="text-xs text-zinc-550 max-w-xs mt-1">Paste an interesting audience question or request, and let AI split it into micro-scripts.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Trend Explorer */}
        {studioTab === "trends" && (
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Trend Explorer</h3>
            <p className="text-zinc-500 text-xs mb-6">Real-time keyword volumes and virality indicators across creator spaces.</p>
            
            <div className="space-y-4">
              {[
                { keyword: "React 19 compiler actions", volume: "Very High", virality: 98, change: "▲ +125%" },
                { keyword: "Indie hackers micro SaaS", volume: "High", virality: 92, change: "▲ +48%" },
                { keyword: "Docker compose postgres dev", volume: "Moderate", virality: 84, change: "▲ +12%" },
                { keyword: "Tailwind CSS v4 upgrades", volume: "High", virality: 89, change: "▲ +67%" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-zinc-900 bg-[#09090b]/40 rounded-xl text-xs">
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{item.keyword}</p>
                      <span className="text-[10px] text-zinc-500">Volume: {item.volume}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-emerald-400 font-semibold">{item.change}</span>
                    <span className="px-2 py-0.5 rounded bg-violet-600/15 text-violet-400 font-mono font-bold text-[10px]">
                      Virality {item.virality}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
