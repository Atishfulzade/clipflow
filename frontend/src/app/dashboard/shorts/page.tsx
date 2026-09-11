"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore, Clip } from "@/store/useAppStore";
import { apiClient } from "@/lib/apiClient";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { 
  Play, 
  Scissors, 
  Sparkles, 
  Smile, 
  Share2, 
  FileText, 
  Layers, 
  Clock, 
  Volume2, 
  Calendar, 
  Check, 
  ChevronRight,
  RefreshCw,
  Plus,
  Loader2,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ShortsPageContent() {
  const searchParams = useSearchParams();
  const queryVideoId = searchParams ? searchParams.get("videoId") : null;

  const { 
    user,
    clips, 
    schedulePost, 
    brandColor, 
    watermarkText, 
    connectedChannels, 
    fetchChannels, 
    renderClip,
    brandPresets,
    fetchBrandPresets,
    saveBrandPreset,
    deleteBrandPreset,
    setBrandKit,
    fetchProjectsAndVideos
  } = useAppStore();
  const [selectedClip, setSelectedClip] = useState<Clip | null>(clips[0] || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);

  const getClipUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${baseUrl}${url}`;
  };

  // Brand Presets state
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);

  // Load all dashboard data on mount
  React.useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchChannels(),
          fetchBrandPresets(),
          fetchProjectsAndVideos()
        ]);
      } catch (err) {
        console.error("Failed to load dashboard and shorts data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, [fetchChannels, fetchBrandPresets, fetchProjectsAndVideos]);

  // Reactively select the default or queried clip when clips are loaded
  React.useEffect(() => {
    if (clips.length > 0) {
      if (queryVideoId) {
        const matchingClip = clips.find(c => c.videoId === queryVideoId);
        if (matchingClip) {
          setSelectedClip(matchingClip);
          return;
        }
      }
      if (!selectedClip) {
        setSelectedClip(clips[0]);
      }
    }
  }, [clips, selectedClip, queryVideoId]);
  const [captionStyle, setCaptionStyle] = useState("beast");
  const [enableEmojis, setEnableEmojis] = useState(true);
  const [enableProgressBar, setEnableProgressBar] = useState(true);
  const [enableWatermark, setEnableWatermark] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"captions" | "titles" | "hashtags" | "repurpose" | "schedule">("captions");
  const [captionFont, setCaptionFont] = useState("Arial");
  const [captionPosition, setCaptionPosition] = useState("bottom");

  const beastWords = ["THIS", "IS", "A", "SECRET", "TRICK!"];
  const podcastWords = ["The", "biggest", "mistake", "is", "scaling", "before", "you", "get", "customers."];
  const minimalistWords = ["scaling", "simple", "and", "clean"];

  const [activeWordIndex, setActiveWordIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => {
        const maxWords = captionStyle === "beast" ? 5 : captionStyle === "podcast" ? 9 : 4;
        return (prev + 1) % maxWords;
      });
    }, 450);
    return () => clearInterval(interval);
  }, [captionStyle]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!presetId) return;
    const preset = brandPresets.find(p => p.id === presetId);
    if (preset) {
      setCaptionStyle(preset.captionStyle);
      setEnableEmojis(preset.enableEmojis);
      setEnableProgressBar(preset.enableProgressBar);
      setEnableWatermark(preset.enableWatermark);
      setBrandKit(preset.brandColor, preset.watermarkText || "");
      setCaptionFont(preset.captionFont || "Arial");
      setCaptionPosition(preset.captionPosition || "bottom");
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    setPresetToDelete(presetId);
  };

  const confirmDeletePreset = async () => {
    if (!presetToDelete) return;
    await deleteBrandPreset(presetToDelete);
    setSelectedPresetId("");
    setPresetToDelete(null);
  };

  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    setIsSavingPreset(true);
    try {
      await saveBrandPreset({
        name: newPresetName,
        captionStyle,
        brandColor,
        watermarkText,
        enableEmojis,
        enableProgressBar,
        enableWatermark,
        captionFont,
        captionPosition,
      });
      setIsSaveModalOpen(false);
      setNewPresetName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPreset(false);
    }
  };

  // AI-generated clip metadata suggestions state (real backend data)
  const [metadata, setMetadata] = useState<{ titles: string[]; description: string; hashtags: string[] } | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customHashtags, setCustomHashtags] = useState("");
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  // Scheduler state
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledPlatform, setScheduledPlatform] = useState<"YOUTUBE" | "INSTAGRAM" | "TIKTOK" | "LINKEDIN" | "X">("TIKTOK");
  const [isScheduling, setIsScheduling] = useState(false);

  // Fetch real metadata whenever selectedClip changes
  React.useEffect(() => {
    if (!selectedClip) {
      setMetadata(null);
      setSelectedTitle("");
      setCustomDescription("");
      setCustomHashtags("");
      return;
    }
    
    const loadMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const data = await apiClient.get<{ titles: string[]; description: string; hashtags: string[] }>(`/api/clips/${selectedClip.id}/metadata`);
        setMetadata(data);
        setSelectedTitle(selectedClip.title || data.titles[0] || "");
        setCustomDescription(data.description || "");
        setCustomHashtags(data.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(" ") || "");
      } catch (err) {
        console.error("Failed to load clip metadata:", err);
        // Robust fallback
        setMetadata({
          titles: [selectedClip.title, "Viral Highlight: " + selectedClip.title, "Inside look: " + selectedClip.title],
          description: selectedClip.transcriptText || "",
          hashtags: ["shorts", "viral", "tech"]
        });
        setSelectedTitle(selectedClip.title || "");
        setCustomDescription(selectedClip.transcriptText || "");
        setCustomHashtags("#shorts #viral");
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    
    loadMetadata();
  }, [selectedClip]);

  const generateNewTitles = async () => {
    if (!selectedClip) return;
    setIsGeneratingTitles(true);
    try {
      const data = await apiClient.get<{ titles: string[]; description: string; hashtags: string[] }>(`/api/clips/${selectedClip.id}/metadata`);
      setMetadata(data);
      if (data.titles.length > 0) {
        setSelectedTitle(data.titles[0]);
      }
    } catch (err) {
      console.error("Failed to regenerate metadata:", err);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handlePostScheduling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClip || !scheduledTime) return;
    setIsScheduling(true);

    try {
      const parsedHashtags = customHashtags
        .split(" ")
        .map(h => h.replace('#', '').trim())
        .filter(h => h.length > 0);

      await schedulePost(
        selectedClip.id,
        scheduledPlatform,
        new Date(scheduledTime).toISOString(),
        selectedTitle,
        customDescription,
        parsedHashtags
      );
      setScheduledTime("");
    } catch (err) {
      console.error("Scheduling failed:", err);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Shorts Studio</h1>
        <p className="text-zinc-500 text-sm mt-1">Design captions, generate copywriting headers, repurpose to text formats, and schedule publishing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Clips List (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Detected Clips</h3>
          
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : clips.length === 0 ? (
              <div className="text-center p-6 border border-zinc-900 rounded-xl bg-zinc-950/20 text-xs text-zinc-500">
                No clips generated yet. Import a video to start.
              </div>
            ) : (
              clips.map((clip) => {
                const isSelected = selectedClip?.id === clip.id;
                return (
                  <div 
                    key={clip.id}
                    onClick={() => setSelectedClip(clip)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected 
                        ? "border-violet-500 bg-violet-500/5" 
                        : "border-zinc-900 bg-zinc-950/20 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-zinc-300"}`}>
                        {clip.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600/10 text-violet-400 font-mono font-bold">
                        {clip.viralityScore}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                      <span>Duration: {clip.end - clip.start}s</span>
                      <span>Range: {clip.start}s - {clip.end}s</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Col: Preview Player (Span 4) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider self-start mb-4">9:16 Visual Studio</h3>
          
          {selectedClip ? (
            <div className="w-full max-w-[280px] aspect-[9/16] rounded-2xl border border-zinc-850 bg-black relative overflow-hidden shadow-2xl flex flex-col justify-between p-4">
              
              {/* Rendering Overlay */}
              {isRendering && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
                  <p className="text-xs font-bold text-white">Rendering Captions...</p>
                  <span className="text-[9px] text-zinc-500 font-mono">Burning fonts & progress bar...</span>
                </div>
              )}
              
              {/* Top Watermark / Status */}
              <div className="flex justify-between items-center z-10">
                {enableWatermark ? (
                  <span className="text-[9px] bg-black/60 px-2 py-0.5 rounded text-white/50 border border-white/10 font-bold select-none">
                    {watermarkText}
                  </span>
                ) : <div />}
                <span 
                  className="text-[9px] text-white font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: brandColor }}
                >
                  98% VIRAL
                </span>
              </div>

              {/* HTML5 Video Player */}
              {selectedClip.clipUrl ? (
                <video 
                  key={selectedClip.id}
                  src={getClipUrl(selectedClip.clipUrl)}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover -z-10"
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-900/50 flex flex-col items-center justify-center -z-10 text-center p-4">
                  <Play className="w-8 h-8 text-zinc-700 mb-2" />
                  <span className="text-[10px] text-zinc-500 font-semibold">Generating Video Clip...</span>
                </div>
              )}

              {/* Captions Overlay (Only show if not already burned into the completed file) */}
              {selectedClip.captionsStatus !== 'COMPLETED' && (
                <div 
                  className={`absolute left-4 right-4 z-10 text-center space-y-4 transition-all duration-300 ${
                    captionPosition === 'top' ? 'top-16' :
                    captionPosition === 'middle' ? 'top-1/2 -translate-y-1/2' :
                    'bottom-16'
                  }`}
                >
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Outfit:wght@900&display=swap');
                `}</style>

                {captionStyle === "beast" && (
                  <div 
                    className="text-lg font-black tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase flex justify-center gap-1.5 flex-wrap"
                    style={{ fontFamily: captionFont }}
                  >
                    <span className="sr-only">THIS IS A SECRET TRICK!</span>
                    <span>🚀</span>
                    {beastWords.map((word, idx) => (
                      <span 
                        key={idx}
                        className="transition-all duration-150 inline-block"
                        style={{
                          color: idx === activeWordIndex ? brandColor : '#facc15',
                          transform: idx === activeWordIndex ? 'scale(1.15)' : 'scale(1.0)'
                        }}
                      >
                        {word}
                      </span>
                    ))}
                    {enableEmojis && <span>🤯</span>}
                  </div>
                )}

                {captionStyle === "podcast" && (
                  <div 
                    className="text-sm font-semibold tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex justify-center gap-1 flex-wrap"
                    style={{ fontFamily: captionFont }}
                  >
                    <span className="sr-only">The biggest mistake is scaling before you get customers.</span>
                    <span>"</span>
                    {podcastWords.map((word, idx) => {
                      const isActive = idx === activeWordIndex;
                      return (
                        <span 
                          key={idx}
                          className="transition-all duration-150"
                          style={{
                            color: isActive ? brandColor : '#ffffff',
                            textDecoration: isActive ? 'underline' : 'none',
                            textDecorationColor: brandColor,
                            textDecorationThickness: '2px'
                          }}
                        >
                          {word}
                        </span>
                      );
                    })}
                    <span>"</span>
                    {enableEmojis && <span>📈</span>}
                  </div>
                )}

                {captionStyle === "minimalist" && (
                  <div 
                    className="text-xs font-mono tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex justify-center gap-1 flex-wrap"
                    style={{ fontFamily: captionFont }}
                  >
                    <span className="sr-only">scaling simple.</span>
                    {minimalistWords.map((word, idx) => (
                      <span 
                        key={idx}
                        className="transition-all duration-150"
                        style={{
                          color: idx === activeWordIndex ? '#ffffff' : '#71717a'
                        }}
                      >
                        {word}
                      </span>
                    ))}
                    {enableEmojis && <span>💡</span>}
                  </div>
                )}

                {/* Progress bar overlay */}
                {enableProgressBar && (
                  <div className="h-1.5 w-full bg-zinc-900/60 rounded-full overflow-hidden border border-zinc-800/20">
                    <div 
                      className="h-full rounded-full transition-all duration-300" 
                      style={{ 
                        backgroundColor: brandColor,
                        width: `${((activeWordIndex + 1) / (captionStyle === "beast" ? 5 : captionStyle === "podcast" ? 9 : 4)) * 100}%`
                      }}
                    />
                  </div>
                )}

              </div>
            )}

            </div>
          ) : (
            <EmptyState
              title="No Clip Selected"
              description="Choose a viral clip highlight from the sidebar list on the left to activate the 9:16 layout designer and customize subtitle styles."
              icon={Scissors}
            />
          )}

          {/* Quick Trim Slider */}
          {selectedClip && (
            <div className="w-full max-w-[280px] mt-4 space-y-1 bg-zinc-950/20 border border-zinc-900 p-3 rounded-xl">
              <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                <span>Start: {selectedClip.start}s</span>
                <span>End: {selectedClip.end}s</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full relative">
                <div 
                  className="absolute left-[15%] right-[25%] h-full rounded-full" 
                  style={{ backgroundColor: brandColor }}
                />
                <div 
                  className="absolute left-[15%] w-3 h-3 rounded-full bg-white border -top-0.5 cursor-pointer" 
                  style={{ borderColor: brandColor }}
                />
                <div 
                  className="absolute right-[25%] w-3 h-3 rounded-full bg-white border -top-0.5 cursor-pointer" 
                  style={{ borderColor: brandColor }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Editor Configurations (Span 5) */}
        <div className="lg:col-span-5 bg-zinc-950/20 border border-zinc-900 rounded-2xl p-6">
          
          {/* Sub Navigation */}
          <div className="flex gap-2 border-b border-zinc-900 pb-4 overflow-x-auto">
            {[
              { id: "captions", label: "Captions" },
              { id: "titles", label: "Titles" },
              { id: "hashtags", label: "Hashtags" },
              { id: "repurpose", label: "Repurpose" },
              { id: "schedule", label: "Schedule" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSubTab === tab.id 
                    ? "bg-zinc-900 text-white border border-zinc-800" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-6">
            <AnimatePresence mode="wait">
              
              {/* Captions Tab */}
              {activeSubTab === "captions" && (
                <motion.div 
                  key="captionsTab"
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  {user?.role === "CLIENT" && (
                    <div className="p-3 bg-violet-950/20 border border-violet-900/50 rounded-xl text-xs text-violet-400 font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <span>Read-Only: Client workspace role. Saving presets and video rendering are restricted.</span>
                    </div>
                  )}
                  {/* Brand Presets Selector */}
                  <div className="space-y-3 p-4 border border-zinc-900 bg-zinc-900/10 rounded-xl">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Brand Presets</label>
                      {user?.role !== "CLIENT" && (
                        <button 
                          type="button"
                          onClick={() => setIsSaveModalOpen(true)}
                          className="text-[10px] text-violet-400 font-bold hover:text-violet-300 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Save Preset
                        </button>
                      )}
                    </div>

                    {brandPresets.length === 0 ? (
                      <div className="text-[11px] text-zinc-500 text-center py-1">
                        No presets saved. Customize styling below and click "Save Preset".
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <select
                          value={selectedPresetId}
                          onChange={(e) => handleSelectPreset(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-500"
                        >
                          <option value="">-- Apply Reusable Preset --</option>
                          {brandPresets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {preset.name}
                            </option>
                          ))}
                        </select>
                        {selectedPresetId && user?.role !== "CLIENT" && (
                          <button
                            type="button"
                            onClick={() => handleDeletePreset(selectedPresetId)}
                            className="px-2.5 py-1.5 rounded-lg border border-red-950 bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-xs font-bold"
                            title="Delete Preset"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Subtitle Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => setCaptionStyle("beast")}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          captionStyle === "beast" 
                            ? "border-violet-500 bg-violet-500/5 text-yellow-400" 
                            : "border-zinc-900 bg-zinc-900/10 text-zinc-400"
                        }`}
                      >
                        ⚡ Beast Style
                      </button>
                      <button 
                        onClick={() => setCaptionStyle("podcast")}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          captionStyle === "podcast" 
                            ? "border-violet-500 bg-violet-500/5 text-white" 
                            : "border-zinc-900 bg-zinc-900/10 text-zinc-400"
                        }`}
                      >
                        🎙️ Podcast Glow
                      </button>
                      <button 
                        onClick={() => setCaptionStyle("minimalist")}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          captionStyle === "minimalist" 
                            ? "border-violet-500 bg-violet-500/5 text-zinc-300" 
                            : "border-zinc-900 bg-zinc-900/10 text-zinc-400"
                        }`}
                      >
                        💡 Minimalist
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-900">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold text-white">Auto Sync Emojis</p>
                        <span className="text-[10px] text-zinc-500">Inject animated emojis at verbal cues.</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={enableEmojis}
                        onChange={(e) => setEnableEmojis(e.target.checked)}
                        className="rounded border-zinc-800 text-violet-600 focus:ring-violet-500 bg-zinc-900 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold text-white">Visual Progress Bar</p>
                        <span className="text-[10px] text-zinc-500">Render horizontal progress bar on video overlay.</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={enableProgressBar}
                        onChange={(e) => setEnableProgressBar(e.target.checked)}
                        className="rounded border-zinc-800 text-violet-600 focus:ring-violet-500 bg-zinc-900 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold text-white">Brand Watermark</p>
                        <span className="text-[10px] text-zinc-500">Automatically overlay your saved logo.</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={enableWatermark}
                        onChange={(e) => setEnableWatermark(e.target.checked)}
                        className="rounded border-zinc-800 text-violet-600 focus:ring-violet-500 bg-zinc-900 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Brand Customization Inputs */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Brand Color</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={brandColor}
                          onChange={(e) => setBrandKit(e.target.value, watermarkText)}
                          className="bg-zinc-900 border border-zinc-800 rounded w-8.5 h-8.5 p-0 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={brandColor}
                          onChange={(e) => setBrandKit(e.target.value, watermarkText)}
                          className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none w-full font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Watermark Text</label>
                      <input 
                        type="text" 
                        value={watermarkText}
                        onChange={(e) => setBrandKit(brandColor, e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-500"
                        placeholder="e.g. VIBECUT.AI"
                      />
                    </div>
                  </div>

                  {/* Font and Position Selectors */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Subtitle Font</label>
                      <select 
                        value={captionFont}
                        onChange={(e) => setCaptionFont(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-500"
                      >
                        <option value="Arial">Arial (Default)</option>
                        <option value="Impact">Impact (Bold Short)</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Inter">Inter</option>
                        <option value="Outfit">Outfit</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Caption Position</label>
                      <select 
                        value={captionPosition}
                        onChange={(e) => setCaptionPosition(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-500"
                      >
                        <option value="bottom">Bottom Overlay</option>
                        <option value="middle">Middle Center</option>
                        <option value="top">Top Overlay</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-900">
                    <button
                      type="button"
                      disabled={!selectedClip || isRendering || user?.role === "CLIENT"}
                      onClick={async () => {
                        if (!selectedClip) return;
                        setIsRendering(true);
                        try {
                          const updated = await renderClip(selectedClip.id, {
                            captionStyle,
                            enableEmojis,
                            enableProgressBar,
                            enableWatermark,
                            brandColor,
                            watermarkText,
                            captionFont,
                            captionPosition
                          });
                          setSelectedClip(updated);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsRendering(false);
                        }
                      }}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-750 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> {user?.role === "CLIENT" ? "Render Restricted" : "Render Styled Video"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Titles Generator Tab */}
              {activeSubTab === "titles" && (
                <motion.div 
                  key="titlesTab"
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Suggested Titles</span>
                    <button 
                      onClick={generateNewTitles}
                      disabled={isGeneratingTitles || isLoadingMetadata}
                      className="text-[10px] text-violet-400 font-bold flex items-center gap-1 hover:text-violet-300"
                    >
                      <RefreshCw className={`w-3 h-3 ${(isGeneratingTitles || isLoadingMetadata) ? "animate-spin" : ""}`} /> Regenerate
                    </button>
                  </div>

                  {isLoadingMetadata ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-900/5 rounded-xl border border-zinc-900 border-dashed">
                      <Loader2 className="w-6 h-6 text-violet-500 animate-spin mb-2" />
                      <span className="text-xs text-zinc-500">Generating viral title hook variations...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(metadata?.titles || [selectedTitle]).map((title, idx) => {
                        const isSelected = selectedTitle === title;
                        return (
                          <div 
                            key={idx}
                            onClick={() => setSelectedTitle(title)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                              isSelected 
                                ? "border-violet-500 bg-violet-500/5" 
                                : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800"
                            }`}
                          >
                            <span className={`text-xs leading-relaxed ${isSelected ? "text-white font-bold" : "text-zinc-300 group-hover:text-white"}`}>{title}</span>
                            {isSelected ? (
                              <Check className="w-4 h-4 text-violet-400 flex-shrink-0 ml-2" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-violet-400 transition-colors flex-shrink-0 ml-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Hashtag Generator Tab */}
              {activeSubTab === "hashtags" && (
                <motion.div 
                  key="hashtagsTab"
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-4"
                >
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Generated Hashtags</span>
                  
                  {isLoadingMetadata ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-900/5 rounded-xl border border-zinc-900 border-dashed">
                      <Loader2 className="w-6 h-6 text-violet-500 animate-spin mb-2" />
                      <span className="text-xs text-zinc-500">Generating trending niche hashtags...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 border border-zinc-900 bg-zinc-900/10 rounded-xl space-y-1.5 relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-red-400 font-mono">YouTube Shorts</span>
                          <button 
                            onClick={() => {
                              const tags = "#shorts " + (metadata?.hashtags || []).map((t: string) => `#${t}`).join(" ");
                              setCustomHashtags(tags);
                              setScheduledPlatform("YOUTUBE");
                              setActiveSubTab("schedule");
                            }}
                            className="text-[9px] text-violet-400 hover:text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity font-semibold"
                          >
                            Apply to Post
                          </button>
                        </div>
                        <p className="text-xs text-zinc-300 font-mono">#shorts {(metadata?.hashtags || []).map((t: string) => `#${t}`).join(" ")}</p>
                      </div>

                      <div className="p-3 border border-zinc-900 bg-zinc-900/10 rounded-xl space-y-1.5 relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-pink-400 font-mono">TikTok</span>
                          <button 
                            onClick={() => {
                              const tags = "#fyp #viral " + (metadata?.hashtags || []).map((t: string) => `#${t}`).join(" ");
                              setCustomHashtags(tags);
                              setScheduledPlatform("TIKTOK");
                              setActiveSubTab("schedule");
                            }}
                            className="text-[9px] text-violet-400 hover:text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity font-semibold"
                          >
                            Apply to Post
                          </button>
                        </div>
                        <p className="text-xs text-zinc-300 font-mono">#fyp #viral {(metadata?.hashtags || []).map((t: string) => `#${t}`).join(" ")}</p>
                      </div>

                      <div className="p-3 border border-zinc-900 bg-zinc-900/10 rounded-xl space-y-1.5 relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-purple-400 font-mono">Instagram Reels</span>
                          <button 
                            onClick={() => {
                              const tags = "#reels " + (metadata?.hashtags || []).map((t: string) => `#${t}`).join(" ");
                              setCustomHashtags(tags);
                              setScheduledPlatform("INSTAGRAM");
                              setActiveSubTab("schedule");
                            }}
                            className="text-[9px] text-violet-400 hover:text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity font-semibold"
                          >
                            Apply to Post
                          </button>
                        </div>
                        <p className="text-xs text-zinc-300 font-mono">#reels {(metadata?.hashtags || []).map((t: string) => `#${t}`).join(" ")}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Repurpose Tab */}
              {activeSubTab === "repurpose" && (
                <motion.div 
                  key="repurposeTab"
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-4"
                >
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Repurpose to Text Formats</span>
                  
                  <div className="space-y-3.5">
                    
                    <div className="p-3 border border-zinc-900 bg-[#09090b]/40 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-blue-400 font-mono">X Thread (10 posts)</span>
                        <button className="text-[10px] text-violet-400 font-bold hover:text-violet-300">Copy Text</button>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">1/ React Server Components are not just SSR. Let's unpack the biggest misconceptions...</p>
                    </div>

                    <div className="p-3 border border-zinc-900 bg-[#09090b]/40 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">Newsletter Content</span>
                        <button className="text-[10px] text-violet-400 font-bold hover:text-violet-300">Copy Text</button>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">Hey creators, Alex here. Let's talk about the database latency bottleneck in React...</p>
                    </div>

                    <div className="p-3 border border-zinc-900 bg-[#09090b]/40 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-purple-400 font-mono">Blog Post Summary</span>
                        <button className="text-[10px] text-violet-400 font-bold hover:text-violet-300">Copy Text</button>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">Title: The Full Architecture Guide to Server Components. In modern frontend development...</p>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* Schedule Tab */}
              {activeSubTab === "schedule" && (
                <motion.div 
                  key="scheduleTab"
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-4"
                >
                  {["EDITOR", "CLIENT"].includes(user?.role || "") && (
                    <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium mb-4 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>Scheduling Restricted: Owner or Manager privileges are required.</span>
                    </div>
                  )}
                  
                  <form onSubmit={handlePostScheduling} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Selected Title</label>
                      <input 
                        type="text" 
                        value={selectedTitle}
                        onChange={(e) => setSelectedTitle(e.target.value)}
                        required
                        disabled={["EDITOR", "CLIENT"].includes(user?.role || "")}
                        placeholder="Customize your short title..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none disabled:opacity-50"
                      />
                      <span className="text-[9px] text-zinc-500 mt-1 block font-medium">Quick Tip: Select other options under the "Titles" tab.</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">AI Caption Description</label>
                      <textarea 
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        rows={3}
                        required
                        disabled={["EDITOR", "CLIENT"].includes(user?.role || "")}
                        placeholder="Write video copy description..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg p-3 text-xs text-white outline-none disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Video Hashtags</label>
                      <input 
                        type="text" 
                        value={customHashtags}
                        onChange={(e) => setCustomHashtags(e.target.value)}
                        disabled={["EDITOR", "CLIENT"].includes(user?.role || "")}
                        placeholder="e.g. #shorts #coding"
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none disabled:opacity-50"
                      />
                      <span className="text-[9px] text-zinc-500 mt-1 block font-medium">Quick Tip: Select and apply pre-formatted tags under the "Hashtags" tab.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Select Channel</label>
                        <select 
                          value={scheduledPlatform}
                          onChange={(e) => setScheduledPlatform(e.target.value as any)}
                          disabled={["EDITOR", "CLIENT"].includes(user?.role || "")}
                          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-violet-500 disabled:opacity-50"
                        >
                          {['TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'LINKEDIN', 'X'].map((plat) => {
                            const connected = connectedChannels.find(c => c.platform.toUpperCase() === plat);
                            return (
                              <option key={plat} value={plat}>
                                {plat} {connected ? `(${connected.channelName})` : '(Simulated)'}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Schedule Time</label>
                        <input 
                          type="datetime-local" 
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          required
                          disabled={["EDITOR", "CLIENT"].includes(user?.role || "")}
                          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-violet-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isScheduling || !scheduledTime || ["EDITOR", "CLIENT"].includes(user?.role || "")}
                      className="w-full py-2.5 bg-violet-600 hover:bg-violet-750 disabled:opacity-50 transition-colors text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isScheduling ? "Scheduling..." : "Add to Publishing Queue"}
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

    {/* Save Preset Modal */}
    <AnimatePresence>
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold text-white">Save Custom Style Preset</h3>
              <p className="text-xs text-zinc-500 mt-1">Name your design style preset to reuse it dynamically on other clips.</p>
            </div>

            <form onSubmit={handleSavePreset} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Preset Name</label>
                <input 
                  type="text" 
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  required
                  placeholder="e.g. Neon Podcast, Minimalist Bold"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsSaveModalOpen(false);
                    setNewPresetName("");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSavingPreset || !newPresetName.trim()}
                  className="px-4 py-1.5 bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isSavingPreset ? "Saving..." : "Save Preset"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Delete Preset Modal */}
    <AnimatePresence>
      {presetToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold text-white">Delete Brand Preset</h3>
              <p className="text-xs text-zinc-500 mt-1">Are you sure you want to delete this brand preset? This action cannot be undone.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setPresetToDelete(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={confirmDeletePreset}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-750 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    </div>
  );
}

export default function ShortsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    }>
      <ShortsPageContent />
    </Suspense>
  );
}
