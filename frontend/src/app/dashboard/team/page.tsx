"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, ShieldCheck, Mail, Clock, FolderKanban, Loader2, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Skeleton from "@/components/Skeleton";

export default function TeamPage() {
  const { 
    user, 
    members, 
    pendingInvites, 
    receivedInvitations,
    fetchMembers, 
    inviteMember, 
    updateMemberRole,
    removeMember,
    cancelInvitation,
    approveInvitation,
    fetchReceivedInvitations,
    acceptReceivedInvitation,
    declineReceivedInvitation,
    projects, 
    fetchProjectsAndVideos,
    addToast 
  } = useAppStore();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteeName, setInviteeName] = useState("");
  const [inviteRole, setInviteRole] = useState("EDITOR");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState<string | null>(null);

  const activeTeamId = user?.teams?.[0]?.teamId;
  const isOwner = user?.role === "OWNER";

  const emailExists = inviteEmail.trim() !== "" && (
    members.some((m) => m.user?.email?.toLowerCase() === inviteEmail.trim().toLowerCase()) ||
    pendingInvites.some((p) => p.email?.toLowerCase() === inviteEmail.trim().toLowerCase())
  );

  // Find the team member who has the OWNER role to display their name to collaborators
  const ownerMember = members.find((mem) => mem.role === "OWNER" || mem.user?.role === "OWNER");
  const ownerDisplayName = ownerMember?.user?.name || ownerMember?.user?.email || "the workspace owner";

  useEffect(() => {
    const loadTeamData = async () => {
      setIsLoading(true);
      try {
        const promises: Promise<any>[] = [
          fetchReceivedInvitations(),
          fetchProjectsAndVideos()
        ];
        if (activeTeamId) {
          promises.push(fetchMembers(activeTeamId));
        }
        await Promise.all(promises);
      } catch (err) {
        console.error("Failed to load team workspace data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTeamData();
  }, [activeTeamId, fetchMembers, fetchProjectsAndVideos, fetchReceivedInvitations]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteeName || !activeTeamId) return;
    
    setIsInviting(true);
    setInviteSuccessMessage(null);
    try {
      await inviteMember({
        teamId: activeTeamId,
        email: inviteEmail,
        role: inviteRole,
        projectId: selectedProjectId || undefined,
        inviteeName,
      });
      
      addToast(`Successfully sent invitation email to ${inviteeName}!`, "SUCCESS");
      setInviteSuccessMessage(`Successfully sent invitation email to ${inviteeName}!`);
      setInviteEmail("");
      setInviteeName("");
      setSelectedProjectId("");
    } catch (err: any) {
      console.error("Failed to invite collaborator:", err);
      addToast(err.message || "Failed to send invitation. Please try again.", "ERROR");
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-60 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <Skeleton className="h-80 w-full" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Team Workspace</h1>
        <p className="text-zinc-500 text-sm mt-1">Invite content editors, brand managers, and clients to review draft clip exports and collaborate on specific projects.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Invite Form or Warning Banner */}
        {isOwner ? (
          <form onSubmit={handleInvite} className="lg:col-span-5 p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-[40px] pointer-events-none" />
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Mail className="w-4.5 h-4.5 text-violet-400" /> Invite Collaborator
            </h3>
            
            <div>
              <label className="text-[10px] font-bold text-zinc-455 block mb-1.5 uppercase tracking-wider">Invitee Full Name</label>
              <input 
                type="text"
                value={inviteeName}
                onChange={(e) => {
                  setInviteeName(e.target.value);
                  if (inviteSuccessMessage) setInviteSuccessMessage(null);
                }}
                placeholder="Sarah Editor"
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-455 block mb-1.5 uppercase tracking-wider">Email Address</label>
              <input 
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (inviteSuccessMessage) setInviteSuccessMessage(null);
                }}
                placeholder="editor@company.com"
                required
                className={`w-full bg-zinc-900/50 border ${
                  emailExists ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-violet-500'
                } focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none`}
              />
              {emailExists && (
                <span className="text-[10px] text-red-400 font-semibold mt-1 block">
                  This email is already in your workspace or has a pending invite.
                </span>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-455 block mb-1.5 uppercase tracking-wider">Workspace Role</label>
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
              >
                <option value="EDITOR">Editor (Can edit clips, change templates)</option>
                <option value="MANAGER">Manager (Can sync platforms, schedule calendar)</option>
                <option value="CLIENT">Client Reviewer (View clips, post comments only)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-455 block mb-1.5 uppercase tracking-wider">Project Access Binding</label>
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">All Workspace Projects (General Access)</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {inviteSuccessMessage && (
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg font-medium flex items-center justify-between">
                <span>{inviteSuccessMessage}</span>
                <button 
                  type="button" 
                  onClick={() => setInviteSuccessMessage(null)}
                  className="text-emerald-400 hover:text-white font-bold text-sm leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}

            <button 
              type="submit"
              disabled={isInviting || !activeTeamId || emailExists}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-750 transition-colors text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isInviting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Send Collaboration Invite</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="lg:col-span-5 p-6 border border-yellow-900/30 bg-yellow-950/10 rounded-2xl space-y-3 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-[40px] pointer-events-none" />
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Access Restricted</h4>
                <p className="text-zinc-450 text-xs mt-1 leading-relaxed">
                  Only the Workspace Owner has permissions to invite new collaborators to this workspace team. Contact <strong className="text-violet-400 font-semibold">{ownerDisplayName}</strong> to add new members.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Active Members & Pending Invites lists */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Received Workspace Invitations */}
          {receivedInvitations.length > 0 && (
            <div className="border border-violet-900 bg-violet-950/20 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Mail className="w-4.5 h-4.5 text-violet-400" /> Received Invitations ({receivedInvitations.length})
              </h3>
              <p className="text-zinc-400 text-xs mt-1">You have been invited to join the workspaces listed below. Accept to join and collaborate.</p>
              
              <div className="space-y-3">
                {receivedInvitations.map((invite) => {
                  const inviterName = invite.invitedBy?.name || invite.invitedBy?.email || "Workspace Owner";
                  const teamName = invite.team?.name || "Workspace Team";
                  const projectName = invite.project?.name || "General Workspace";
                  
                  return (
                    <div key={invite.id} className="p-4 border border-violet-900/50 bg-[#09090b]/40 rounded-xl text-xs space-y-3 transition-colors hover:border-violet-850">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white">Invitation to join <span className="text-violet-400">"{teamName}"</span></p>
                          <span className="text-[10px] text-zinc-500 font-mono">Invited by: {inviterName} ({invite.invitedBy?.email})</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-violet-600/10 text-violet-400 font-extrabold font-mono border border-violet-500/10 uppercase">
                          {invite.role}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-[10px] text-zinc-500 border-t border-zinc-900/50 pt-2">
                        <span className="flex items-center gap-1">
                          <FolderKanban className="w-3.5 h-3.5 text-zinc-650" /> Project Access Binding: <strong className="text-zinc-400 font-semibold">{projectName}</strong>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-900/30">
                        <button 
                          onClick={() => acceptReceivedInvitation(invite.id)}
                          className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded px-3 py-1.5 cursor-pointer transition-colors"
                        >
                          Accept & Join
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to decline the invitation to join ${teamName}?`)) {
                              declineReceivedInvitation(invite.id);
                            }
                          }}
                          className="text-[10px] bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-red-400 rounded px-3 py-1.5 cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Members Card */}
          <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-violet-400" /> Active Workspace Members ({members.length})
            </h3>

            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="text-center p-6 border border-zinc-900/50 border-dashed rounded-xl text-xs text-zinc-500">
                  No active team members.
                </div>
              ) : (
                members.map((mem) => {
                  const memberName = mem.user?.name || mem.user?.email.split("@")[0] || "Collaborator";
                  const memberEmail = mem.user?.email || "";
                  const boundProject = mem.project?.name || "General Workspace";
                  return (
                    <div key={mem.id} className="p-3 border border-zinc-900 bg-[#09090b]/40 rounded-xl text-xs space-y-2 transition-colors hover:border-zinc-800">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white">{memberName}</p>
                          <span className="text-[10px] text-zinc-500 font-mono">{memberEmail}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-violet-600/10 text-violet-400 font-extrabold font-mono border border-violet-500/10 uppercase">{mem.role}</span>
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        </div>
                      </div>
                      
                      {/* Project binding info - do not show for Owner as they have full access */}
                      {mem.role !== "OWNER" && (
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-900/50 pt-2">
                          <span className="flex items-center gap-1">
                            <FolderKanban className="w-3.5 h-3.5 text-zinc-650" /> Project Access: <strong className="text-zinc-400 font-semibold">{boundProject}</strong>
                          </span>
                          {mem.invitedBy && (
                            <span>
                              Invited by: <strong className="text-zinc-400">{mem.invitedBy.name || mem.invitedBy.email}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Owner administrative controls to change roles or remove members */}
                      {isOwner && mem.user?.id !== user.id && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-900/30">
                          <select 
                            value={mem.role}
                            onChange={(e) => updateMemberRole(mem.id, e.target.value, mem.projectId || undefined)}
                            className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1 outline-none cursor-pointer"
                          >
                            <option value="EDITOR">Editor</option>
                            <option value="MANAGER">Manager</option>
                            <option value="CLIENT">Client</option>
                          </select>
                          <select 
                            value={mem.projectId || ""}
                            onChange={(e) => updateMemberRole(mem.id, mem.role, e.target.value || undefined)}
                            className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1 outline-none max-w-[140px] truncate cursor-pointer"
                          >
                            <option value="">All Projects</option>
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${memberName} from the workspace?`)) {
                                removeMember(mem.id, activeTeamId);
                              }
                            }}
                            className="text-[10px] bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 text-red-400 rounded px-2 py-1 cursor-pointer transition-colors font-medium ml-auto"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Invites Card */}
          <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-yellow-500" /> Pending Invitations ({pendingInvites.length})
            </h3>

            <div className="space-y-3">
              {pendingInvites.length === 0 ? (
                <div className="text-center p-6 border border-zinc-900/50 border-dashed rounded-xl text-xs text-zinc-500">
                  No pending invitations.
                </div>
              ) : (
                pendingInvites.map((invite) => {
                  const boundProject = invite.project?.name || "General Workspace";
                  const inviterName = invite.invitedBy?.name || invite.invitedBy?.email?.split("@")[0] || "Owner";
                  return (
                    <div key={invite.id} className="p-3 border border-zinc-900 bg-[#09090b]/40 rounded-xl text-xs space-y-2 transition-colors hover:border-zinc-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white">{invite.inviteeName}</p>
                          <span className="text-[10px] text-zinc-500 font-mono">{invite.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono font-bold border border-zinc-850 uppercase">{invite.role}</span>
                          <span className="text-[10px] font-bold text-yellow-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-900/50 pt-2">
                        <span className="flex items-center gap-1">
                          <FolderKanban className="w-3.5 h-3.5 text-zinc-650" /> Project: <strong className="text-zinc-400">{boundProject}</strong>
                        </span>
                        <span>
                          Invited by: <strong className="text-zinc-400">{inviterName}</strong>
                        </span>
                      </div>

                      {/* Owner administrative controls to cancel pending invitations */}
                      {isOwner && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-900/30">
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to cancel the invitation for ${invite.inviteeName}?`)) {
                                cancelInvitation(invite.id, activeTeamId);
                              }
                            }}
                            className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded px-2.5 py-1.5 cursor-pointer transition-colors font-medium ml-auto"
                          >
                            Cancel Invite
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
