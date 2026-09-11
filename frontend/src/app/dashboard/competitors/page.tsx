"use client";

import React, { useState } from "react";
import { useAppStore, Channel } from "@/store/useAppStore";
import { Play, Eye, Plus, ArrowRight, Loader2, BarChart2, Calendar, Clock, Hash, Flame } from "lucide-react";

export default function CompetitorsPage() {
  const { competitorChannels, addCompetitorChannel } = useAppStore();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(competitorChannels[0] || null);
  const [channelUrl, setChannelUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelUrl) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      addCompetitorChannel(channelUrl);
      setChannelUrl("");
      setIsAnalyzing(false);
      
      // Auto select the new channel
      const channels = useAppStore.getState().competitorChannels;
      const latest = channels[channels.length - 1];
      if (latest) setSelectedChannel(latest);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Competitor Analysis</h1>
        <p className="text-zinc-500 text-sm mt-1">Audit competing creator channels, identify content gaps, and generate suggested video concepts.</p>
      </div>

      {/* Input bar */}
      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-violet-400" />
          <span className="text-xs font-semibold text-zinc-300">Add a competitor channel to audit</span>
        </div>
        <form onSubmit={handleAnalysis} className="flex gap-2 w-full md:w-auto flex-1 max-w-xl">
          <input 
            type="text"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            placeholder="https://youtube.com/@fireship"
            className="flex-1 bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-650 outline-none"
          />
          <button 
            type="submit"
            disabled={isAnalyzing || !channelUrl}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Audit"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Channels list (3 Span) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Monitored Channels</h3>
          <div className="space-y-3">
            {competitorChannels.map((chan) => {
              const isSelected = selectedChannel?.id === chan.id;
              return (
                <div 
                  key={chan.id}
                  onClick={() => setSelectedChannel(chan)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                    isSelected 
                      ? "border-violet-500 bg-violet-500/5" 
                      : "border-zinc-900 bg-zinc-950/20 hover:border-zinc-800"
                  }`}
                >
                  <img 
                    src={chan.avatarUrl} 
                    alt={chan.name} 
                    className="w-10 h-10 rounded-full object-cover border border-zinc-900"
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-zinc-300"}`}>{chan.name}</p>
                    <span className="text-[10px] text-zinc-500">{chan.handle} • {(chan.subscribers / 1000000).toFixed(2)}M subs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Details (8 Span) */}
        <div className="lg:col-span-8">
          {selectedChannel ? (
            <div className="border border-zinc-900 bg-zinc-950/20 rounded-2xl p-6 space-y-6">
              
              {/* Header Info */}
              <div className="flex gap-4 pb-6 border-b border-zinc-900 items-center">
                <img 
                  src={selectedChannel.avatarUrl} 
                  alt={selectedChannel.name} 
                  className="w-16 h-16 rounded-full object-cover border border-zinc-900"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedChannel.name} Analytics Audit</h3>
                  <p className="text-xs text-zinc-500 mt-1">{selectedChannel.handle} • {(selectedChannel.views / 1000000).toFixed(0)}M views total</p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-xl border border-zinc-900 bg-[#09090b]/40">
                  <div className="flex gap-1.5 items-center text-zinc-500 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Upload Frequency</span>
                  </div>
                  <p className="text-sm font-bold text-white">{selectedChannel.avgUploads}</p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-900 bg-[#09090b]/40">
                  <div className="flex gap-1.5 items-center text-zinc-500 mb-1">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Best Posting Time</span>
                  </div>
                  <p className="text-sm font-bold text-white">{selectedChannel.bestPostTime}</p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-900 bg-[#09090b]/40">
                  <div className="flex gap-1.5 items-center text-zinc-500 mb-1">
                    <Hash className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Core Niche</span>
                  </div>
                  <p className="text-sm font-bold text-white">Tech tutorials</p>
                </div>

              </div>

              {/* Keywords and Content Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-violet-400" /> Hot Topics & Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedChannel.trendingKeywords.map((word, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-violet-400" /> Content Gap Opportunities
                  </h4>
                  <ul className="text-xs text-zinc-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500">•</span>
                      <span>Next.js 15 routing changes has high demand but low video counts.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500">•</span>
                      <span>Prisma Serverless connection failures are frequently asked in comments.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Recommended Action CTA */}
              <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-3">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider">Suggested Concept To Replicate</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  "Next.js 15 Caching is BROKEN? 😱" - A 45s short breaking down cache defaults, replicating {selectedChannel.name}'s high-energy visual pacing.
                </p>
                <button className="text-xs text-white font-bold flex items-center gap-1 hover:underline">
                  Generate Script Concept <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
                </button>
              </div>

            </div>
          ) : (
            <div className="h-96 border border-dashed border-zinc-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-zinc-900/5">
              <Eye className="w-12 h-12 text-zinc-700 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-400">No Channel Selected</h3>
              <p className="text-xs text-zinc-550 max-w-xs mt-1">Audit a channel above or select an existing monitor in the sidebar.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
