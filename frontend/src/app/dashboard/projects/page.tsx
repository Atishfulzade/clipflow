"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { FolderKanban, Plus, Calendar, Video, ArrowRight } from "lucide-react";
import Link from "next/link";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

export default function ProjectsPage() {
  const { projects, addProject } = useAppStore();
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName) return;
    addProject(projName, projDesc);
    setProjName("");
    setProjDesc("");
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Projects</h1>
          <p className="text-zinc-500 text-sm mt-1">Organize your imports and clips into isolated project directories.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 transition-colors text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl max-w-lg space-y-4">
          <h3 className="text-sm font-bold text-white">Create New Project</h3>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Project Name</label>
            <input 
              type="text" 
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              placeholder="e.g. Daily TikTok Hooks"
              required
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Description (Optional)</label>
            <input 
              type="text" 
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              placeholder="Short-form clips for product launch"
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="px-3 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-lg text-xs font-semibold text-zinc-400"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-semibold"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Grid of Projects */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No Projects Yet"
          description="Create your first project directory below to start importing YouTube videos and extracting viral shorts."
          icon={FolderKanban}
          actionText="Create Project"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="p-6 border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 transition-all rounded-2xl flex flex-col justify-between h-44">
              <div>
                <div className="w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white truncate">{proj.name}</h3>
                <p className="text-zinc-550 text-xs mt-1 truncate">{proj.description || "No description"}</p>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-zinc-900/40">
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-650" /> {proj.createdAt}
                </span>
                <Link href="/dashboard/videos" className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1">
                  Open Workspace <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
