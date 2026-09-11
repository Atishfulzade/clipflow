"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Video, 
  Scissors, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Eye, 
  MessageSquare, 
  Users, 
  CreditCard, 
  Settings, 
  Zap, 
  Bell, 
  Menu,
  X,
  LogOut,
  ChevronDown,
  Shield
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { 
    user, 
    token,
    isAuthenticated,
    isLoadingUser,
    checkAuth, 
    logout,
    fetchProjectsAndVideos,
    fetchPosts,
    videos,
    clips,
    posts,
    projects,
    competitorChannels,
    notifications,
    unreadNotificationsCount,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setupNotificationStream
  } = useAppStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // 1. Enforce strict authentication on dashboard access
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoadingUser, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjectsAndVideos();
      fetchPosts();
    }
  }, [isAuthenticated, token, fetchProjectsAndVideos, fetchPosts]);

  // 1.5 Setup real-time notifications stream on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications();
      const unsubscribe = setupNotificationStream();
      return () => unsubscribe();
    }
  }, [isAuthenticated, token, fetchNotifications, setupNotificationStream]);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    router.push("/login");
  };

  // 2. Filter navigation links based on user role and data presence
  const allNavigation: SidebarLink[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "Videos", href: "/dashboard/videos", icon: Video },
    { name: "Shorts", href: "/dashboard/shorts", icon: Scissors },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Team Workspace", href: "/dashboard/team", icon: Users },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Admin Panel", href: "/dashboard/admin", icon: Shield },
  ];

  const navigation = allNavigation.filter((item) => {
    if (item.href === "/dashboard/admin") {
      return user && user.email === "atishfulzade1234@gmail.com";
    }
    if (item.href === "/dashboard/projects") {
      return projects && projects.length > 0;
    }
    if (item.href === "/dashboard/videos") {
      return videos && videos.length > 0;
    }
    if (item.href === "/dashboard/shorts") {
      return clips && clips.length > 0;
    }
    if (item.href === "/dashboard/calendar") {
      return posts && posts.length > 0;
    }
    if (item.href === "/dashboard/studio") {
      return videos && videos.length > 0;
    }
    if (item.href === "/dashboard/analytics") {
      return videos && videos.length > 0;
    }
    if (item.href === "/dashboard/coach") {
      return videos && videos.length > 0;
    }
    if (item.href === "/dashboard/competitors") {
      return competitorChannels && competitorChannels.length > 0;
    }
    return true;
  });

  // Guard loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400 font-medium">Loading workspace session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Let the redirect effect run
  }

  const initials = user.name ? user.name.split(" ").map((n) => n[0]).join("") : "?";

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans antialiased selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-900 bg-zinc-950 p-4 h-screen sticky top-0 justify-between">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 px-2">
            <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              VibeCut<span className="text-violet-500">.ai</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-zinc-900 text-white border border-zinc-800" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-zinc-500"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="border-t border-zinc-900 pt-4 space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-violet-500/10">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-none mb-1">{user.name || user.email.split("@")[0]}</p>
              <span className="text-[9px] text-violet-400 font-extrabold font-mono bg-violet-600/10 px-1.5 py-0.5 rounded border border-violet-500/20 uppercase">
                Role: {user.role || "OWNER"}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogoutClick}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-500" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
            <div className="w-64 bg-zinc-950 p-4 border-r border-zinc-900 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-violet-600 rounded flex items-center justify-center">
                      <Scissors className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white">VibeCut</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="text-zinc-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                          isActive 
                            ? "bg-zinc-900 text-white border border-zinc-800" 
                            : "text-zinc-400 hover:bg-zinc-900/40"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-zinc-550"}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-zinc-900 pt-4 space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-violet-500/10">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate leading-none mb-1">{user.name || user.email.split("@")[0]}</p>
                    <span className="text-[9px] text-violet-400 font-extrabold font-mono bg-violet-600/10 px-1.5 py-0.5 rounded border border-violet-500/20 uppercase">
                      Role: {user.role || "OWNER"}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleLogoutClick}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all duration-150 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header bar */}
        <header className="h-14 border-b border-zinc-900 bg-zinc-950/20 px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1 rounded-md text-zinc-400 hover:bg-zinc-900 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-zinc-400 flex items-center gap-1.5 select-none">
              <span>Workspace</span>
              <span className="text-zinc-700">/</span>
              <span className="text-white capitalize">{pathname.split("/").pop() || "Dashboard"}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Trigger */}
            <div className="relative">
              <button 
                onClick={() => setNotifDropdown(!notifDropdown)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors relative focus:outline-none"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                )}
              </button>

              {notifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl p-3 z-50 max-h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-900 shrink-0">
                    <span className="text-xs font-semibold text-white">Notifications {unreadNotificationsCount > 0 && `(${unreadNotificationsCount})`}</span>
                    {unreadNotificationsCount > 0 && (
                      <span 
                        onClick={() => markAllNotificationsAsRead()} 
                        className="text-[10px] text-violet-400 hover:text-violet-350 cursor-pointer font-medium transition-colors"
                      >
                        Mark all read
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0 max-h-72 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-xs">
                        No notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.read && markNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            n.read 
                              ? 'bg-zinc-950/20 border-zinc-900/50 text-zinc-500' 
                              : 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-850 text-zinc-200 cursor-pointer hover:bg-zinc-900/60'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-[11px] font-semibold leading-normal ${n.read ? 'text-zinc-500' : 'text-white'}`}>{n.title}</p>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-450 mt-1 leading-normal">{n.message}</p>
                          <span className="text-[8px] text-zinc-600 mt-1.5 block font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User profile menu dropdown */}
            <div className="h-8 w-px bg-zinc-900" />
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer group focus:outline-none select-none"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-[10px] text-white shadow-lg shadow-violet-500/20">
                  {initials}
                </div>
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{user.name || user.email.split("@")[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {userDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1.5 duration-100">
                    <div className="px-3 py-2 border-b border-zinc-900">
                      <p className="text-xs font-semibold text-white truncate">{user.name || user.email.split("@")[0]}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                    </div>
                    
                    <div className="p-1">
                      <Link 
                        href="/dashboard/settings" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Account Settings</span>
                      </Link>
                      
                      <Link 
                        href="/dashboard/billing" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Billing & Subscription</span>
                      </Link>

                      {user.role === "OWNER" && (
                        <Link 
                          href="/dashboard/admin" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                    </div>

                    <div className="p-1 border-t border-zinc-900">
                      <button 
                        onClick={(e) => {
                          setUserDropdownOpen(false);
                          handleLogoutClick(e);
                        }}
                        className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Inner Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
