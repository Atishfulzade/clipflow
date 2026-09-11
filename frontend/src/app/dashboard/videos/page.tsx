"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, Video } from "@/store/useAppStore";
import { Play, FileText, Sparkles, MessageSquare, Plus, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

export default function VideosPage() {
  const router = useRouter();
  const { projects, videos, addVideo, runVideoProcessor, fetchProjectsAndVideos } = useAppStore();
  const [selectedVidId, setSelectedVidId] = useState<string | null>(null);
  const selectedVid = videos.find(v => v.id === selectedVidId) || videos[0] || null;
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchProjectsAndVideos();
  }, [fetchProjectsAndVideos]);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) return;
    setIsImporting(true);
    
    try {
      const activeProjectId = projects[0]?.id || "proj-youtube-shorts";
      const vidId = await addVideo(activeProjectId, "Imported YouTube Session", youtubeUrl);
      runVideoProcessor(vidId);
      setSelectedVidId(vidId);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setYoutubeUrl("");
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("video", file);
    const activeProjectId = projects[0]?.id || "proj-youtube-shorts";
    formData.append("projectId", activeProjectId);
    formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

    try {
      const token = localStorage.getItem("vibecut_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${baseUrl}/api/videos/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload video file");
      }

      const data = await res.json();
      await fetchProjectsAndVideos();
      runVideoProcessor(data.video.id);
      setSelectedVidId(data.video.id);
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerClipping = (vidId: string) => {
    runVideoProcessor(vidId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Videos Workspace</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage imported videos, inspect transcript text segments, and execute AI splitting.</p>
      </div>

      {/* Import & Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40">
        
        {/* Paste YouTube Link Column */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Import from YouTube</h3>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Paste a link to a YouTube video to transcribe, analyze highlights, and generate vertical clips.</p>
          </div>
          
          <form onSubmit={handleImport} className="flex gap-2 mt-4">
            <input 
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
            />
            <button 
              type="submit"
              disabled={isImporting || !youtubeUrl}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              {isImporting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Import Link"}
            </button>
          </form>
        </div>

        {/* Divider for small screens */}
        <div className="md:hidden border-t border-zinc-900 my-2" />
        
        {/* Upload Local Video Column */}
        <div className="space-y-4 md:border-l md:border-zinc-900 md:pl-6">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Upload Video File</h3>
          </div>
          <p className="text-xs text-zinc-500">Select or drop a local MP4, MOV, or WEBM video file to upload and process directly.</p>
          
          <div className="flex items-center justify-center w-full mt-2">
            <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-zinc-800 hover:border-violet-500/50 rounded-lg cursor-pointer bg-zinc-900/10 hover:bg-violet-500/5 transition-all">
              <div className="flex flex-col items-center justify-center pt-3 pb-3 text-center px-4">
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin mb-2" />
                    <p className="text-[11px] font-semibold text-zinc-300">Uploading and queuing video...</p>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-zinc-500 mb-2" />
                    <p className="text-[11px] font-semibold text-zinc-405">Click to select video file</p>
                    <span className="text-[9px] text-zinc-600 mt-1">MP4, MOV, WEBM (Max 100MB)</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                className="hidden" 
              />
            </label>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Videos List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">All Videos ({videos.length})</h2>
          
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : videos.length === 0 ? (
              <div className="text-center p-8 border border-zinc-900 rounded-xl bg-zinc-950/20 text-xs text-zinc-500">
                No videos imported or uploaded yet.
              </div>
            ) : (
              videos.map((vid) => {
                const isSelected = selectedVid?.id === vid.id;
                return (
                  <div 
                    key={vid.id}
                    onClick={() => setSelectedVidId(vid.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                      isSelected 
                        ? "border-violet-500 bg-violet-500/5" 
                        : "border-zinc-900 bg-zinc-950/20 hover:border-zinc-800"
                    }`}
                  >
                    <div className="w-20 h-12 rounded object-cover border border-zinc-900 bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                      {vid.thumbnail ? (
                        <img 
                          src={vid.thumbnail} 
                          alt={vid.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Play className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-zinc-300"}`}>
                        {vid.title}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-zinc-500">{vid.duration ? `${Math.round(parseFloat(vid.duration))}s` : "Processing"}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          vid.status === 'COMPLETED' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : vid.status === 'FAILED'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-violet-500/10 text-violet-400 animate-pulse'
                        }`}>
                          {vid.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Video Inspector */}
        <div className="lg:col-span-2">
          {selectedVid ? (
            <div className="border border-zinc-900 bg-zinc-950/20 rounded-2xl p-6 space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-900">
                <div className="flex gap-4">
                  <div className="w-28 h-16 rounded-lg border border-zinc-900 shadow-md bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                    {selectedVid.thumbnail ? (
                      <img 
                        src={selectedVid.thumbnail} 
                        alt={selectedVid.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{selectedVid.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                      <span>Duration: {selectedVid.duration ? `${Math.round(parseFloat(selectedVid.duration))}s` : "0s"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-zinc-600" /> {selectedVid.commentsCount || 0} comments</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {selectedVid.status === 'COMPLETED' ? (
                    <button 
                      onClick={() => router.push(`/dashboard/shorts?videoId=${selectedVid.id}`)}
                      className="w-full sm:w-auto px-4 py-2 bg-violet-600 hover:bg-violet-700 transition-colors text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5"
                    >
                      View Clips <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => triggerClipping(selectedVid.id)}
                      disabled={selectedVid.status !== 'PENDING'}
                      className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition-colors text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Extract Clips
                    </button>
                  )}
                </div>
              </div>

              {/* Transcript Inspector */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" /> Synced Transcript
                </h4>
                
                {selectedVid.status === 'COMPLETED' && selectedVid.transcript && selectedVid.transcript.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {(selectedVid.transcript || []).map((seg, idx) => (
                      <div key={idx} className="p-3 bg-zinc-900/10 border border-zinc-900 hover:border-zinc-850 transition-colors rounded-lg flex items-start gap-4">
                        <span className="text-[10px] font-mono text-violet-400 bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10 flex-shrink-0 mt-0.5">
                          {Math.floor(seg.start)}s - {Math.floor(seg.end)}s
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed">{seg.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 border border-zinc-900 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-4 bg-zinc-900/10">
                    <Loader2 className={`w-8 h-8 text-zinc-600 mb-3 ${selectedVid.status !== 'PENDING' ? 'animate-spin text-violet-500' : ''}`} />
                    <p className="text-xs font-semibold text-zinc-400">
                      {selectedVid.status === 'PENDING' && 'Transcript is ready. Click "Extract Clips" to begin.'}
                      {selectedVid.status === 'TRANSCRIBING' && 'Whisper transcription is currently active. Please wait.'}
                      {selectedVid.status === 'ANALYZING' && 'Extracting key hook sections. Please wait.'}
                      {selectedVid.status === 'FAILED' && 'AI processing failed. Check server logs.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Original Link details */}
              {selectedVid.youtubeUrl && !selectedVid.youtubeUrl.includes('mock-upload') && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/20 border border-zinc-900 text-xs">
                  <span className="text-zinc-500">Source Link</span>
                  <a 
                    href={selectedVid.youtubeUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 font-semibold"
                  >
                    YouTube Video <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

            </div>
          ) : (
            <EmptyState
              title="No Video Selected"
              description="Select an existing video from the list on the left to inspect clips and transcript, or paste a new YouTube link / upload a file."
              icon={Play}
            />
          )}
        </div>

      </div>

    </div>
  );
}
