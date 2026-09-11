"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { 
  BarChart3, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp, 
  Clock, 
  Play, 
  SlidersHorizontal,
  Globe
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";

// Custom inline SVG icons for social channels to avoid Turbopack lucide issues
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.59-.73v7.02c0 3.75-2.58 7.22-6.32 7.73-3.04.45-6.19-.88-7.57-3.62-1.39-2.73-.85-6.22 1.34-8.38 1.72-1.73 4.29-2.31 6.55-1.57v4.21c-1.18-.46-2.57-.22-3.51.59-.97.82-1.29 2.17-.79 3.32.49 1.14 1.74 1.89 2.97 1.75 1.17-.11 2.22-.98 2.37-2.15.03-1.14.01-2.29.01-3.44V.02z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function AnalyticsPage() {
  const { analyticsData, fetchAnalytics, brandColor } = useAppStore();
  const [platformFilter, setPlatformFilter] = useState<"ALL" | "YOUTUBE" | "TIKTOK" | "INSTAGRAM">("ALL");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  // 1. Loading Skeletons
  if (!hasMounted || !analyticsData) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9.5 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>

        {/* KPI metrics row skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>

        {/* Graphs layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const { timeseriesData, retentionCurve, topClips, summary } = analyticsData;

  // 1.5. Show clean empty state if there are no views / no real analytics data yet
  if (!summary || summary.totalViews === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Analytics Workspace</h1>
          <p className="text-zinc-500 text-sm mt-1">Audit viewer reach, average retention segments, and engagement indices cross-platform.</p>
        </div>

        <div className="h-96 border border-dashed border-zinc-850 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-zinc-900/5">
          <BarChart3 className="w-12 h-12 text-zinc-700 mb-4" />
          <h3 className="text-sm font-semibold text-zinc-400">No Analytics Data Available Yet</h3>
          <p className="text-xs text-zinc-550 max-w-sm mt-1.5 leading-relaxed">
            Analytics metrics will populate automatically once you connect your social channels, extract clips, and schedule them to be published.
          </p>
        </div>
      </div>
    );
  }

  // 2. Format timeseries data for Recharts based on filter
  const chartData = timeseriesData.map((d: any) => {
    if (platformFilter === "YOUTUBE") {
      return { date: d.date, views: d.YOUTUBE.views, likes: d.YOUTUBE.likes };
    }
    if (platformFilter === "TIKTOK") {
      return { date: d.date, views: d.TIKTOK.views, likes: d.TIKTOK.likes };
    }
    if (platformFilter === "INSTAGRAM") {
      return { date: d.date, views: d.INSTAGRAM.views, likes: d.INSTAGRAM.likes };
    }
    return {
      date: d.date,
      YouTube: d.YOUTUBE.views,
      TikTok: d.TIKTOK.views,
      Instagram: d.INSTAGRAM.views,
      views: d.totalViews,
    };
  });

  // 3. Compute KPI display cards based on filter
  let displayViews = summary.totalViews;
  let displayLikes = summary.totalLikes;
  let displayComments = summary.totalComments;
  let displayShares = summary.totalShares;
  let displayRetention = "63%";

  if (platformFilter !== "ALL") {
    const platformSum = summary.platforms[platformFilter];
    displayViews = platformSum.views;
    displayLikes = platformSum.likes;
    displayComments = platformSum.comments;
    displayShares = platformSum.shares;
    
    if (platformFilter === "YOUTUBE") displayRetention = "62%";
    else if (platformFilter === "TIKTOK") displayRetention = "59%";
    else if (platformFilter === "INSTAGRAM") displayRetention = "65%";
  }

  const displayEngagement = displayLikes + displayComments + displayShares;
  const displayEngagementRate = displayViews > 0 ? ((displayEngagement / displayViews) * 100).toFixed(1) + "%" : "0%";

  // 4. Data for PieChart (Platform distribution share)
  const pieData = [
    { name: "YouTube Shorts", value: summary.platforms.YOUTUBE.views, color: "#ef4444" },
    { name: "TikTok clips", value: summary.platforms.TIKTOK.views, color: "#ec4899" },
    { name: "Instagram Reels", value: summary.platforms.INSTAGRAM.views, color: "#a855f7" }
  ];

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Analytics Workspace</h1>
          <p className="text-zinc-500 text-sm mt-1">Audit viewer reach, average retention segments, and engagement indices cross-platform.</p>
        </div>

        {/* Platforms Filter Bar */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 border border-zinc-900 rounded-xl overflow-x-auto w-full md:w-auto">
          {[
            { id: "ALL", label: "All Channels", icon: Globe },
            { id: "YOUTUBE", label: "YouTube Shorts", icon: YoutubeIcon },
            { id: "TIKTOK", label: "TikTok", icon: TiktokIcon },
            { id: "INSTAGRAM", label: "Instagram", icon: InstagramIcon }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPlatformFilter(btn.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                platformFilter === btn.id
                  ? "bg-zinc-900 text-white border border-zinc-800"
                  : "text-zinc-550 hover:text-zinc-300"
              }`}
            >
              <btn.icon className={`w-3.5 h-3.5 ${platformFilter === btn.id ? "text-violet-400" : ""}`} />
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: displayViews.toLocaleString(), icon: Eye, color: "text-blue-400" },
          { label: "Total Engagement", value: displayEngagement.toLocaleString(), icon: Heart, color: "text-pink-400" },
          { label: "Engagement Rate", value: displayEngagementRate, icon: TrendingUp, color: "text-emerald-400" },
          { label: "Avg Clip Retention", value: displayRetention, icon: Clock, color: "text-violet-400" }
        ].map((kpi, idx) => (
          <div key={idx} className="p-5 border border-zinc-900 bg-zinc-950/20 rounded-2xl flex items-center justify-between shadow-sm hover:border-zinc-800 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{kpi.label}</span>
              <p className="text-xl font-extrabold text-white font-mono">{kpi.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Views growth and platform share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Area Chart (Span 2) */}
        <div className="lg:col-span-2 p-5 border border-zinc-900 bg-zinc-950/20 rounded-2xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Daily View Trends</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Reach logs graphed over the past two weeks.</p>
            </div>
            <SlidersHorizontal className="w-4 h-4 text-zinc-650" />
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={brandColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={brandColor} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorYT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTK" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorIG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="date" stroke="#3f3f46" tickLine={false} axisLine={false} />
                <YAxis stroke="#3f3f46" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "12px", color: "#f4f4f5" }}
                  itemStyle={{ fontSize: "11px" }}
                  labelStyle={{ fontSize: "10px", color: "#a1a1aa" }}
                />
                
                {platformFilter === "ALL" ? (
                  <>
                    <Area type="monotone" dataKey="YouTube" stroke="#ef4444" fillOpacity={1} fill="url(#colorYT)" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="TikTok" stroke="#ec4899" fillOpacity={1} fill="url(#colorTK)" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="Instagram" stroke="#a855f7" fillOpacity={1} fill="url(#colorIG)" strokeWidth={1.5} />
                  </>
                ) : (
                  <Area type="monotone" dataKey="views" stroke={brandColor} fillOpacity={1} fill="url(#colorBrand)" strokeWidth={2} />
                )}
                
                <Legend iconSize={8} iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Share Pie Chart */}
        <div className="p-5 border border-zinc-900 bg-zinc-950/20 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Platform Share</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Ratio of views distributed across platform channels.</p>
          </div>

          <div className="h-60 w-full text-xs flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "11px", color: "#f4f4f5" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Color labels legend */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-900/60">
            {pieData.map((plat) => (
              <div key={plat.name} className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plat.color }} />
                  <span className="text-zinc-400 font-semibold">{plat.name}</span>
                </div>
                <span className="text-white font-mono font-bold">{((plat.value / summary.totalViews) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: Retention Curve and Top performing clips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Retention Area Curve */}
        <div className="p-5 border border-zinc-900 bg-zinc-950/20 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-white">Audience Retention</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Avg video watch-time retention curve across selected videos.</p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retentionCurve} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={brandColor} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={brandColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#3f3f46" tickLine={false} />
                <YAxis stroke="#3f3f46" tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "11px", color: "#f4f4f5" }}
                />
                
                {platformFilter === "YOUTUBE" && (
                  <Area type="monotone" dataKey="youtube" stroke="#ef4444" fillOpacity={1} fill="url(#colorRet)" strokeWidth={2} />
                )}
                {platformFilter === "TIKTOK" && (
                  <Area type="monotone" dataKey="tiktok" stroke="#ec4899" fillOpacity={1} fill="url(#colorRet)" strokeWidth={2} />
                )}
                {platformFilter === "INSTAGRAM" && (
                  <Area type="monotone" dataKey="instagram" stroke="#a855f7" fillOpacity={1} fill="url(#colorRet)" strokeWidth={2} />
                )}
                {platformFilter === "ALL" && (
                  <Area type="monotone" dataKey="youtube" name="Avg Retention" stroke={brandColor} fillOpacity={1} fill="url(#colorRet)" strokeWidth={2} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clips Directory (Span 2) */}
        <div className="lg:col-span-2 p-5 border border-zinc-900 bg-zinc-950/20 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Top Performing Clips</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">High virality short-form cuts ranked by total reach.</p>
          </div>

          <div className="overflow-x-auto w-full pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 font-bold">
                  <th className="pb-3 pr-2">Clip Title</th>
                  <th className="pb-3 px-2">Platform</th>
                  <th className="pb-3 px-2">Views</th>
                  <th className="pb-3 px-2">Likes</th>
                  <th className="pb-3 pl-2">Engagement</th>
                  <th className="pb-3 pl-2">Virality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {topClips.map((clip: any) => {
                  let platColor = "text-red-400";
                  if (clip.platform === "TIKTOK") platColor = "text-pink-400";
                  else if (clip.platform === "INSTAGRAM") platColor = "text-purple-400";

                  return (
                    <tr key={clip.id} className="hover:bg-zinc-900/5 transition-colors group">
                      <td className="py-3.5 pr-2 font-semibold text-zinc-200 group-hover:text-white truncate max-w-[150px]">{clip.title}</td>
                      <td className={`py-3.5 px-2 font-bold font-mono text-[10px] uppercase ${platColor}`}>{clip.platform}</td>
                      <td className="py-3.5 px-2 text-zinc-300 font-mono font-medium">{clip.views.toLocaleString()}</td>
                      <td className="py-3.5 px-2 text-zinc-300 font-mono">{clip.likes.toLocaleString()}</td>
                      <td className="py-3.5 px-2 text-zinc-400 font-semibold">{clip.engagementRate}</td>
                      <td className="py-3.5 pl-2">
                        <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-mono font-bold">
                          {clip.viralityScore}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
