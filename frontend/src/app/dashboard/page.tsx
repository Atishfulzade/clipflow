"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Play, 
  Upload, 
  Video, 
  Scissors, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Loader2,
  Sparkles,
  ExternalLink,
  MessageSquare,
  X,
  Globe
} from "lucide-react";

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
import { useAppStore } from "@/store/useAppStore";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from "recharts";

export default function DashboardPage() {
  const { 
    user,
    token,
    videos, 
    clips, 
    posts, 
    addVideo, 
    runVideoProcessor,
    connectedChannels,
    fetchChannels,
    disconnectChannel,
    analyticsData,
    fetchAnalytics
  } = useAppStore();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    fetchChannels();
    fetchAnalytics();
  }, [fetchChannels, fetchAnalytics]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CHANNEL_CONNECTED') {
        setIsConnecting(false);
        setIsLinkModalOpen(false);
        fetchChannels();
        fetchAnalytics();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchChannels, fetchAnalytics]);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) return;
    
    setIsImporting(true);
    
    try {
      const vidId = await addVideo(
        "proj-1",
        "AI Imported Video Highlights",
        youtubeUrl
      );
      runVideoProcessor(vidId);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setYoutubeUrl("");
      setIsImporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      const vidId = await addVideo(
        "proj-1",
        file.name || "Local Video Upload",
        undefined,
        "/mock-clips/uploaded-video.mp4"
      );
      runVideoProcessor(vidId);
    } catch (err) {
      console.error('Local video upload failed:', err);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  // Statistics summaries
  const totalVideos = videos.length;
  const totalClips = clips.length;
  const scheduledPosts = posts.filter(p => p.status === 'SCHEDULED').length;

  const showAnalyticsDashboard = videos.length > 0 && analyticsData && analyticsData.summary && analyticsData.summary.totalViews > 0;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage video imports, clips, and post scheduling.</p>
        </div>
        
        <button 
          onClick={() => {
            const el = document.getElementById("import-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 transition-colors text-white font-semibold rounded-lg text-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Import Video
        </button>
      </div>

      {/* Real KPI Cards - Only visible when related data is present */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {/* KPI 1 - Videos Imported */}
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
            <div className="flex justify-between items-center text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Videos Imported</span>
              <Video className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalVideos}</p>
            <span className="text-[10px] text-zinc-600 font-medium">All projects combined</span>
          </div>

          {/* KPI 2 - Clips Extracted */}
          {totalClips > 0 && (
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
              <div className="flex justify-between items-center text-zinc-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Clips Extracted</span>
                <Scissors className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold text-white">{totalClips}</p>
              <span className="text-[10px] text-violet-400 font-medium">✨ AI powered detection</span>
            </div>
          )}

          {/* KPI 3 - Scheduled Posts */}
          {scheduledPosts > 0 && (
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
              <div className="flex justify-between items-center text-zinc-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Posts</span>
                <Calendar className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold text-white">{scheduledPosts}</p>
              <span className="text-[10px] text-emerald-400 font-medium">Active in calendar</span>
            </div>
          )}

          {/* KPI 4 - Total Views (Real) */}
          {showAnalyticsDashboard && (
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
              <div className="flex justify-between items-center text-zinc-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
                <TrendingUp className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {analyticsData.summary.totalViews >= 1000 
                  ? (analyticsData.summary.totalViews / 1000).toFixed(1) + "K" 
                  : analyticsData.summary.totalViews}
              </p>
              <span className="text-[10px] text-emerald-400 font-medium">▲ Real database metrics</span>
            </div>
          )}

          {/* KPI 5 - Avg. Engagement (Real) */}
          {showAnalyticsDashboard && (
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
              <div className="flex justify-between items-center text-zinc-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg. Engagement</span>
                <MessageSquare className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {analyticsData.summary.totalViews > 0 
                  ? (((analyticsData.summary.totalLikes + analyticsData.summary.totalComments + analyticsData.summary.totalShares) / analyticsData.summary.totalViews) * 100).toFixed(1) + "%" 
                  : "0%"}
              </p>
              <span className="text-[10px] text-violet-400 font-medium">Top performing clips</span>
            </div>
          )}

        </div>
      )}

      {/* Import & Jobs Section */}
      <div id="import-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Import Card */}
        <div className={`${videos.length === 0 ? "lg:col-span-3" : "lg:col-span-2"} p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm flex flex-col justify-between`}>
          <div>
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" /> Import YouTube Video
            </h2>
            <p className="text-zinc-500 text-xs mb-6">Enter any YouTube URL to pull content. AI will automatically transcribe and divide it into clips.</p>
            
            <form onSubmit={handleImport} className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                />
                <button 
                  type="submit"
                  disabled={isImporting || !youtubeUrl}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors text-white font-semibold rounded-lg text-sm flex items-center gap-1.5"
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Import"}
                </button>
              </div>
            </form>
          </div>

          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-zinc-900"></div>
            <span className="flex-shrink mx-4 text-zinc-650 text-xs font-semibold uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-zinc-900"></div>
          </div>

          {/* Local Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-zinc-850 hover:border-zinc-750 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group bg-zinc-900/10"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="video/mp4,video/x-m4v,video/*" 
              className="hidden" 
            />
            <Upload className="w-8 h-8 text-zinc-500 group-hover:text-violet-400 transition-colors mb-3" />
            <span className="text-sm font-semibold text-zinc-300">Drag and drop MP4 video file</span>
            <span className="text-zinc-600 text-xs mt-1">Up to 1.5GB size • 1080p recommended</span>
          </div>
        </div>

        {/* Processing Logs / Queue status - Hidden if no videos exist */}
        {videos.length > 0 && (
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4">Active Processing Logs</h2>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2">
              {videos.map((vid) => (
                <div key={vid.id} className="p-3 border border-zinc-900 rounded-xl bg-[#09090b]/40 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{vid.title}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                      vid.status === 'COMPLETED' 
                        ? 'bg-emerald-500/15 text-emerald-400' 
                        : vid.status === 'FAILED'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-violet-500/15 text-violet-400 animate-pulse'
                    }`}>
                      {vid.status}
                    </span>
                  </div>
                  
                  {/* Loader bar */}
                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full ${
                      vid.status === 'COMPLETED' 
                        ? 'w-full bg-emerald-500' 
                        : vid.status === 'TRANSCRIBING'
                          ? 'w-1/3 bg-violet-500 animate-pulse'
                          : vid.status === 'ANALYZING'
                            ? 'w-2/3 bg-violet-500 animate-pulse'
                            : 'w-full bg-zinc-800'
                    }`} />
                  </div>
                  
                  <span className="text-[9px] text-zinc-500">
                    {vid.status === 'TRANSCRIBING' && 'Running Whisper speech-to-text...'}
                    {vid.status === 'ANALYZING' && 'Evaluating hook virality scores...'}
                    {vid.status === 'COMPLETED' && `Analyzed successfully • ${vid.duration} duration`}
                    {vid.status === 'PENDING' && 'Queued inside background workers...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Graphic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real Performance Chart - Only visible if real analytics views are present */}
        {showAnalyticsDashboard && (
          <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Performance Overview</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Views and engagement tracking across scheduled social networks.</p>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-violet-500" /> Views
                </span>
                <span className="flex items-center gap-1.5 text-zinc-350">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Engagement
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.timeseriesData.map((d: any) => ({
                  name: new Date(d.date).toLocaleDateString([], { weekday: 'short' }),
                  Views: d.totalViews,
                  Engagement: d.YOUTUBE.likes + d.TIKTOK.likes + d.INSTAGRAM.likes
                }))}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                    labelStyle={{ color: "#a1a1aa", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="Views" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="Engagement" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorEngagement)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Channels connected widget - expands to span full width (col-span-3) if chart is hidden */}
        <div className={`${showAnalyticsDashboard ? "lg:col-span-1" : "lg:col-span-3"} p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm flex flex-col justify-between`}>
          <div>
            <h3 className="text-base font-bold text-white mb-2">Connected Platforms</h3>
            <p className="text-xs text-zinc-500 mb-6">Accounts currently connected to your scheduling scheduler.</p>
            
            <div className="space-y-4">
              {['YOUTUBE', 'TIKTOK', 'INSTAGRAM'].map((platform) => {
                const connected = connectedChannels.find(c => c.platform.toUpperCase() === platform);
                
                return (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                        platform === 'YOUTUBE' ? 'bg-red-600/10 border-red-500/20 text-red-500' :
                        platform === 'TIKTOK' ? 'bg-pink-600/10 border-pink-500/20 text-pink-400' :
                        'bg-purple-600/10 border-purple-500/20 text-purple-400'
                      }`}>
                        {platform === 'YOUTUBE' && <Youtube className="w-4 h-4" />}
                        {platform === 'TIKTOK' && <Scissors className="w-4 h-4" />}
                        {platform === 'INSTAGRAM' && <TrendingUp className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200 capitalize">{platform.toLowerCase()} Channel</p>
                        <span className="text-[10px] text-zinc-500">
                          {connected ? `${connected.channelName} • Connected` : 'Not connected'}
                        </span>
                      </div>
                    </div>
                    {connected ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Active</span>
                    ) : (
                      <button 
                        onClick={() => setIsLinkModalOpen(true)}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 font-bold rounded-lg transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => setIsLinkModalOpen(true)}
            className="w-full mt-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 transition-colors text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1"
          >
            Manage Connections <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Link Social Account Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-violet-400" /> Link Social Account
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Connect your channel profiles to schedule video publishing and track analytics.</p>
            </div>

            {isConnecting ? (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-xs font-semibold text-white">Authorizing Account...</p>
                <p className="text-[10px] text-zinc-500">Please complete the connection in the opened secure window.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {['YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'X', 'LINKEDIN'].map((platform) => {
                  const connected = connectedChannels.find(c => c.platform.toUpperCase() === platform);
                  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                  
                  return (
                    <div key={platform} className="flex justify-between items-center p-3 border border-zinc-900 bg-zinc-900/10 hover:border-zinc-850 rounded-xl text-xs transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                          platform === 'YOUTUBE' ? 'bg-red-600/15 text-red-500 border border-red-500/10' :
                          platform === 'TIKTOK' ? 'bg-pink-600/15 text-pink-500 border border-pink-500/10' :
                          platform === 'INSTAGRAM' ? 'bg-purple-600/15 text-purple-500 border border-purple-500/10' :
                          platform === 'X' ? 'bg-zinc-800/60 text-zinc-300 border border-zinc-700/40' :
                          'bg-blue-600/15 text-blue-500 border border-blue-500/10'
                        }`}>
                          <span className="capitalize text-[10px]">{platform.substring(0, 2)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white capitalize">{platform.toLowerCase()}</p>
                          <span className="text-[10px] text-zinc-500">
                            {connected ? connected.channelName : 'Not connected'}
                          </span>
                        </div>
                      </div>
                      
                      {connected ? (
                        <button 
                          type="button"
                          onClick={async () => {
                            await disconnectChannel(connected.id);
                          }}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => {
                            setIsConnecting(true);
                            window.open(`${backendUrl}/api/channels/connect/${platform.toLowerCase()}?userId=${user?.id || 'mock-user-id'}&token=${token || ''}`, '_blank', 'width=600,height=650');
                          }}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 font-bold rounded-lg transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
