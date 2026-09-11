"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, Mail, Lock, User, Sparkles, Loader2, Users, FolderKanban, ShieldAlert } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useAppStore } from "@/store/useAppStore";

function ClaimInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkAuth } = useAppStore();
  
  const token = searchParams ? searchParams.get("token") : null;

  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");

  // 1. Fetch invitation details on mount
  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!token) {
        setErrorMsg("No invitation token provided. Please check your invitation link.");
        setIsLoading(false);
        return;
      }

      try {
        const details = await apiClient.get<any>(`/api/auth/invitations/${token}`);
        setInvitation(details);
        setName(details.inviteeName || "");
      } catch (err: any) {
        console.error("Failed to load invitation details:", err);
        setErrorMsg(err.message || "This invitation link is invalid, expired, or has already been claimed.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setClaimError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setClaimError("Passwords do not match.");
      return;
    }

    setIsClaiming(true);
    setClaimError("");

    try {
      const res = await apiClient.post<{ token: string; user: any }>("/api/auth/invitations/claim", {
        token,
        password,
        name,
      });

      // Save token to local storage and re-auth session
      localStorage.setItem("vibecut_token", res.token);
      await checkAuth();

      // Redirect to dashboard (since onboarding is bypassed)
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Failed to claim invitation:", err);
      setClaimError(err.message || "Failed to claim invitation. Please try again.");
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400 font-medium">Loading workspace invitation...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[80px] pointer-events-none -z-10" />
        
        <div className="w-full max-w-md bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 backdrop-blur-md shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-900/40 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Invitation Link Expired</h2>
            <p className="text-zinc-500 text-xs leading-relaxed">{errorMsg}</p>
          </div>

          <div className="pt-2">
            <Link 
              href="/login" 
              className="inline-block w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold rounded-lg transition-colors border border-zinc-800"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inviterName = invitation?.invitedBy?.name || invitation?.invitedBy?.email?.split("@")[0] || "Owner";
  const teamName = invitation?.team?.name || "their workspace team";
  const projectName = invitation?.project?.name || "General Workspace";
  const assignedRole = invitation?.role || "EDITOR";

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-6 relative selection:bg-violet-500/30 selection:text-violet-200">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 select-none">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-white">
          VibeCut<span className="text-violet-500">.ai</span>
        </span>
      </div>

      {/* Claim Card */}
      <div className="w-full max-w-lg bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 backdrop-blur-md shadow-2xl space-y-6">
        
        {/* Welcome Header info */}
        <div className="p-4 border border-violet-500/10 bg-violet-500/5 rounded-xl space-y-3 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-600/10 rounded-full blur-[30px] pointer-events-none" />
          <h3 className="text-sm font-bold text-white">Join the Collaboration Workspace</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            <strong>{inviterName}</strong> has invited you to join <strong>{teamName}</strong> as a <strong className="text-violet-400">{assignedRole}</strong>.
          </p>
          <div className="flex justify-center items-center gap-6 text-[10px] text-zinc-500 pt-1 border-t border-zinc-900/50">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-zinc-600" /> Team Seat: <strong>{assignedRole}</strong>
            </span>
            <span className="flex items-center gap-1">
              <FolderKanban className="w-3.5 h-3.5 text-zinc-600" /> Project: <strong>{projectName}</strong>
            </span>
          </div>
        </div>

        {claimError && (
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/50 text-red-400 text-xs font-semibold text-center">
            {claimError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-zinc-500" /> Your Full Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-650 outline-none transition-colors"
              placeholder="Sarah Editor"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-zinc-500" /> Email address (ReadOnly)
            </label>
            <input 
              type="email" 
              value={invitation?.email || ""}
              readOnly
              className="w-full bg-zinc-950/40 border border-zinc-900 rounded-lg px-4 py-2.5 text-sm text-zinc-500 outline-none cursor-not-allowed select-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-zinc-500" /> Set Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-650 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-zinc-500" /> Confirm Password
              </label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-650 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isClaiming}
            className="w-full py-3 bg-white hover:bg-zinc-200 text-black disabled:opacity-50 transition-all font-semibold rounded-lg text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {isClaiming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Claiming Workspace Seat...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Claim Seat & Join Team</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ClaimInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400 font-medium">Loading workspace invitation...</p>
      </div>
    }>
      <ClaimInviteContent />
    </Suspense>
  );
}
