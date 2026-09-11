"use client";

import React, { useState } from "react";
import { useAppStore, Post } from "@/store/useAppStore";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Video, Trash2, Scissors, Globe } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function CalendarPage() {
  const { posts, clips, fetchPosts, publishPostImmediately, cancelPost, addToast } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date("2026-06-22")); // Center around local metadata date
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const init = async () => {
      await fetchPosts();
      setIsLoading(false);
    };
    init();
  }, [fetchPosts]);

  // Generate days in month: June 2026
  const year = 2026;
  const monthIdx = 5; // June is 5 (0-indexed)
  
  // June 2026 starts on Monday (index 1 in getDay() is Monday if we start week on Sunday, 
  // but let's calculate programmatically for safety)
  const firstDayOfMonth = new Date(year, monthIdx, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...
  
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate(); // 30 days
  
  const calendarCells = [];
  
  // Fill leading empty cells (for days of previous month)
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  
  // Fill actual month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const getPostsForDay = (day: number) => {
    return posts.filter(p => {
      if (!p.scheduledTime) return false;
      const pDate = new Date(p.scheduledTime);
      return pDate.getFullYear() === year && pDate.getMonth() === monthIdx && pDate.getDate() === day;
    });
  };

  const getPlatformIcon = (platform: Post['platform']) => {
    switch (platform) {
      case 'YOUTUBE':
        return <Youtube className="w-3 h-3 text-red-500" />;
      case 'TIKTOK':
        return <Scissors className="w-3 h-3 text-pink-400" />;
      case 'LINKEDIN':
        return <Linkedin className="w-3 h-3 text-blue-400" />;
      case 'INSTAGRAM':
        return <Instagram className="w-3 h-3 text-purple-400" />;
      case 'X':
        return <XIcon className="w-3 h-3 text-zinc-300" />;
      default:
        return <Globe className="w-3 h-3 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Content Calendar</h1>
          <p className="text-zinc-500 text-sm mt-1">Schedule, organize, and inspect your video clip posts monthly.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-zinc-900 bg-zinc-950 rounded-lg p-1">
            <button className="p-1.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-zinc-300">June 2026</span>
            <button className="p-1.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/20">
        
        {/* Days of week headers */}
        <div className="grid grid-cols-7 border-b border-zinc-900 bg-zinc-950/50 text-center py-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <span key={day} className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{day}</span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 grid-rows-5 auto-rows-[120px] divide-x divide-y divide-zinc-900">
          {calendarCells.map((day, idx) => {
            const isToday = day === 22; // local date is 22nd
            const dayPosts = day ? getPostsForDay(day) : [];
            
            return (
              <div 
                key={idx} 
                className={`p-2 flex flex-col justify-between group transition-colors relative ${
                  day ? "hover:bg-zinc-900/10" : "bg-zinc-950/10"
                } ${isToday ? "bg-violet-950/5" : ""}`}
              >
                {/* Date number */}
                {day && (
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold font-mono ${
                      isToday 
                        ? "w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center" 
                        : "text-zinc-500 group-hover:text-zinc-300"
                    }`}>
                      {day}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-600 hover:text-white transition-opacity">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Day Posts List */}
                <div className="flex-1 overflow-y-auto space-y-1 mt-1.5">
                  {isLoading ? (
                    day && <Skeleton className="h-4 w-full" />
                  ) : (
                    dayPosts.map((post) => {
                      const matchedClip = clips.find(c => c.id === post.clipId);
                      return (
                        <div 
                          key={post.id}
                          onClick={() => addToast(`Post details: "${post.title}" is currently ${post.status}.`, 'INFO')}
                          className={`px-1.5 py-1 rounded text-[10px] border flex items-center gap-1.5 cursor-pointer truncate ${
                            post.status === 'PUBLISHED'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : post.status === 'FAILED'
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                          }`}
                        >
                          {getPlatformIcon(post.platform)}
                          <span className="font-medium truncate">{post.title}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Quick stats queue overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-xl">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Publishing Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Draft Status</span>
              <span className="font-semibold text-white">0 clips</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-550">Ready Queue</span>
              <span className="font-semibold text-white">2 clips</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-550">Scheduled Queue</span>
              <span className="font-semibold text-violet-400">{posts.filter(p => p.status === 'SCHEDULED').length} clips</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-550">Published Content</span>
              <span className="font-semibold text-emerald-400">{posts.filter(p => p.status === 'PUBLISHED').length} clips</span>
            </div>
          </div>
        </div>

        <div className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-xl col-span-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Publishing Queue Logs</h3>
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : posts.length === 0 ? (
              <div className="min-h-[160px] flex items-center justify-center">
                <EmptyState
                  title="No Scheduled Posts"
                  description="Use the Shorts Studio to extract viral clips from long form videos and add them to your content queue."
                  icon={CalendarIcon}
                />
              </div>
            ) : (
              posts.map((post) => {
                const matchedClip = clips.find(c => c.id === post.clipId);
                return (
                  <div key={post.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#09090b]/40 border border-zinc-900 text-xs gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getPlatformIcon(post.platform)}
                      <div className="truncate">
                        <p className="font-semibold text-white leading-none truncate">{post.title}</p>
                        <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                          Scheduled: {post.scheduledTime ? new Date(post.scheduledTime).toLocaleString() : 'Not Set'}
                        </span>
                        {post.postUrl && (
                          <a 
                            href={post.postUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[9px] text-violet-400 hover:underline mt-1 block truncate"
                          >
                            Link: {post.postUrl}
                          </a>
                        )}
                        {post.errorLog && (
                          <span className="text-[9px] text-red-400 mt-1 block truncate">
                            Error: {post.errorLog}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {post.status === 'SCHEDULED' && (
                        <>
                          <button 
                            onClick={() => publishPostImmediately(post.id)}
                            className="px-2 py-1 bg-violet-650 hover:bg-violet-750 text-[10px] text-white font-bold rounded transition-colors shrink-0"
                          >
                            Publish Now
                          </button>
                          <button 
                            onClick={() => cancelPost(post.id)}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-[10px] text-zinc-400 hover:text-red-400 rounded transition-colors shrink-0"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                        post.status === 'PUBLISHED' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : post.status === 'FAILED' 
                            ? 'bg-red-500/10 text-red-400' 
                            : 'bg-violet-500/10 text-violet-400'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
