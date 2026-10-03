"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Sparkles, Sliders, Globe, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function SettingsPage() {
  const { user, token, setUser, brandColor: storeColor, watermarkText: storeWatermark, setBrandKit, addToast, connectedChannels, fetchChannels, disconnectChannel } = useAppStore();
  const [userName, setUserName] = useState(user.name);
  const [brandColor, setBrandColor] = useState(storeColor);
  const [watermarkText, setWatermarkText] = useState(storeWatermark);

  useEffect(() => {
    fetchChannels();

    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      const platform = params.get("platform");
      addToast(`Successfully connected ${platform} channel!`, "SUCCESS");
      if (window.opener) {
        window.opener.postMessage({ type: "CHANNEL_CONNECTED", platform }, "*");
        window.close();
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [fetchChannels, addToast]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CHANNEL_CONNECTED') {
        fetchChannels();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchChannels]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ name: userName });
    setBrandKit(brandColor, watermarkText);
    addToast("Workspace settings and Brand Kit successfully updated!", "SUCCESS");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Configure profile details, brand kits, and linked social channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: General Profile Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-6">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
            <Sliders className="w-4.5 h-4.5 text-violet-400" /> Account & Branding presets
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Creator Name</label>
              <input 
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Email (Read Only)</label>
              <input 
                type="email"
                value={user.email}
                disabled
                className="w-full bg-zinc-900/10 border border-zinc-900 text-zinc-650 rounded-lg px-3 py-2 text-xs select-none outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Brand Highlight Color</label>
              <div className="flex gap-2">
                <input 
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="bg-transparent border-0 w-8 h-8 cursor-pointer rounded overflow-hidden"
                />
                <input 
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Default Watermark Text</label>
              <input 
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 transition-colors text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </form>

        {/* Right Side: Integrations status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Globe className="w-4.5 h-4.5 text-violet-400" /> Linked Social Channels
            </h3>
            <p className="text-zinc-555 text-xs leading-relaxed">Connect YouTube, TikTok, and Instagram accounts to schedule automated video publishing.</p>

            <div className="space-y-3 pt-2">
              {['YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'LINKEDIN', 'X'].map((platform) => {
                const connected = connectedChannels.find(c => c.platform.toUpperCase() === platform);
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
                
                return (
                  <div key={platform} className="flex justify-between items-center text-xs p-3 border border-zinc-900 bg-[#09090b]/40 rounded-xl">
                    <div>
                      <p className="font-semibold text-white capitalize">
                        {platform === 'X' ? 'X (Twitter)' : platform.toLowerCase()}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {connected ? connected.channelName : 'Not connected'}
                      </span>
                    </div>
                    {connected ? (
                      <button 
                        type="button"
                        onClick={() => disconnectChannel(connected.id)}
                        className="p-1 hover:bg-red-500/10 rounded text-zinc-440 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => {
                          window.open(`${backendUrl}/api/channels/connect/${platform.toLowerCase()}?userId=${user.id || 'mock-user-id'}&token=${token || ''}`, '_blank', 'width=600,height=650');
                        }}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
