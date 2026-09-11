"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, ChevronRight, BarChart2, ShieldCheck, Zap } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Skeleton from "@/components/Skeleton";

export default function BillingPage() {
  const { subscription, fetchSubscription, createCheckout, confirmMockCheckout, addToast } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initBilling = async () => {
      await fetchSubscription();
      setIsLoading(false);

      // Check if redirected from Stripe / Mock checkout redirect url
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      const plan = params.get("plan");

      if (sessionId && plan) {
        setIsProcessing(true);
        // Direct mock checkout confirmation trigger
        await confirmMockCheckout(sessionId, plan);
        setIsProcessing(false);
        // Strip parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    initBilling();
  }, [fetchSubscription, confirmMockCheckout]);

  const handleUpgrade = async (plan: 'CREATOR' | 'PRO' | 'AGENCY') => {
    setIsProcessing(true);
    addToast(`Redirecting to Stripe checkout for ${plan} plan...`, "INFO");
    try {
      const url = await createCheckout(plan);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (isLoading || isProcessing) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-60 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || "FREE";
  
  // Quota computations
  let maxQuota = 3;
  let currentCost = "$0.00";
  let planDescription = "Ideal for testing features and importing short video previews.";

  if (currentPlan === "CREATOR") {
    maxQuota = 100;
    currentCost = "$19.00";
    planDescription = "Best suited for active content creators. Automatic emoji subtitles and scheduler enabled.";
  } else if (currentPlan === "PRO") {
    maxQuota = 1000;
    currentCost = "$49.00";
    planDescription = "Premium high-volume features. Access to AI coach queries and custom timeline branding presets.";
  } else if (currentPlan === "AGENCY") {
    maxQuota = 9999; // Unlimited mockup representation
    currentCost = "$99.00";
    planDescription = "Full organization workflow. RBAC team workspace seats, priority render queues, and webhook syncs.";
  }

  const usageCount = 12; // simulated original uploads count
  const remainingCount = maxQuota === 9999 ? "Unlimited" : Math.max(0, maxQuota - usageCount);
  const quotaPercent = Math.min(100, (usageCount / maxQuota) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Billing & Subscriptions</h1>
        <p className="text-zinc-500 text-sm mt-1">Review subscription plan tiers, manage Stripe credit card details, and check usage quotas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Quotas and Current Plan Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current plan card */}
          <div className="p-6 border border-violet-500/20 bg-violet-500/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-[60px] pointer-events-none" />
            <div>
              <span className="text-[10px] bg-violet-650 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">Active Plan</span>
              <h3 className="text-xl font-bold text-white mt-2 capitalize">{currentPlan.toLowerCase()} Plan</h3>
              <p className="text-xs text-zinc-400 mt-1">{planDescription}</p>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-extrabold text-white">{currentCost}</p>
              <span className="text-[10px] text-zinc-500">/monthly billing</span>
            </div>
          </div>

          {/* Usage Quota Card */}
          <div className="p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4.5 h-4.5 text-violet-400" /> Quota Usage
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-400">Monthly Processing Quota</span>
                <span className="text-white">
                  {usageCount} / {maxQuota === 9999 ? "Unlimited" : `${maxQuota} videos`}
                </span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/10">
                <div 
                  className="h-full bg-violet-650 rounded-full" 
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                Quota resets in 30 days. You have {remainingCount} video imports remaining.
              </p>
            </div>
          </div>

          {/* Upgrade Matrix */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">Compare Plan Packages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Creator Card */}
              <div className={`p-5 border rounded-2xl flex flex-col justify-between ${
                currentPlan === 'CREATOR' ? 'border-violet-500 bg-violet-500/5' : 'border-zinc-900 bg-zinc-950/20'
              }`}>
                <div>
                  <h4 className="text-xs font-bold text-zinc-300">Creator Tier</h4>
                  <p className="text-xl font-bold text-white mt-1">$19/mo</p>
                  <ul className="text-[10px] text-zinc-500 space-y-1.5 mt-4">
                    <li>• 100 videos processed</li>
                    <li>• Social media scheduler</li>
                    <li>• Auto emoji captions</li>
                  </ul>
                </div>
                {currentPlan === 'CREATOR' ? (
                  <span className="w-full mt-6 py-2 bg-zinc-900 text-center text-xs font-bold text-zinc-500 rounded-xl cursor-default select-none border border-zinc-800/40">Current Plan</span>
                ) : (
                  <button 
                    onClick={() => handleUpgrade('CREATOR')}
                    disabled={currentPlan === 'PRO' || currentPlan === 'AGENCY'}
                    className="w-full mt-6 py-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
                  >
                    Select Plan
                  </button>
                )}
              </div>

              {/* Pro Card */}
              <div className={`p-5 border rounded-2xl flex flex-col justify-between relative ${
                currentPlan === 'PRO' ? 'border-violet-500 bg-violet-500/5' : 'border-zinc-900 bg-zinc-950/20'
              }`}>
                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-300">Pro Tier</h4>
                  <p className="text-xl font-bold text-white mt-1">$49/mo</p>
                  <ul className="text-[10px] text-zinc-500 space-y-1.5 mt-4">
                    <li>• 1,000 video imports</li>
                    <li>• AI channel coach chatbot</li>
                    <li>• Custom timeline watermarks</li>
                  </ul>
                </div>
                {currentPlan === 'PRO' ? (
                  <span className="w-full mt-6 py-2 bg-zinc-900 text-center text-xs font-bold text-zinc-500 rounded-xl cursor-default select-none border border-zinc-800/40">Current Plan</span>
                ) : (
                  <button 
                    onClick={() => handleUpgrade('PRO')}
                    className="w-full mt-6 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Upgrade Tier
                  </button>
                )}
              </div>

              {/* Agency Card */}
              <div className={`p-5 border rounded-2xl flex flex-col justify-between ${
                currentPlan === 'AGENCY' ? 'border-violet-500 bg-violet-500/5' : 'border-zinc-900 bg-zinc-950/20'
              }`}>
                <div>
                  <h4 className="text-xs font-bold text-zinc-300">Agency Tier</h4>
                  <p className="text-xl font-bold text-white mt-1">$99/mo</p>
                  <ul className="text-[10px] text-zinc-500 space-y-1.5 mt-4">
                    <li>• Team accounts (10 seats)</li>
                    <li>• Custom permission logic</li>
                    <li>• Priority queue rendering</li>
                  </ul>
                </div>
                {currentPlan === 'AGENCY' ? (
                  <span className="w-full mt-6 py-2 bg-zinc-900 text-center text-xs font-bold text-zinc-500 rounded-xl cursor-default select-none border border-zinc-800/40">Current Plan</span>
                ) : (
                  <button 
                    onClick={() => handleUpgrade('AGENCY')}
                    className="w-full mt-6 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Upgrade Tier
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right Side: Credit Card Details & Invoice logs */}
        <div className="space-y-6">
          
          {/* Card Info */}
          <div className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-violet-400" /> Payment Details
            </h3>
            
            <div className="p-3 bg-[#09090b]/40 border border-zinc-900 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-8 h-5 bg-zinc-850 rounded flex items-center justify-center font-bold font-mono text-[9px] text-zinc-400">VISA</span>
                <span className="text-zinc-300">•••• 4242</span>
              </div>
              <span className="text-zinc-500">Exp: 09/28</span>
            </div>
          </div>

          {/* Invoice History */}
          <div className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-violet-400" /> Invoice History
            </h3>

            <div className="space-y-3">
              {[
                { date: "June 22, 2026", amount: currentCost, status: currentPlan === 'FREE' ? "N/A" : "Paid" },
                { date: "May 22, 2026", amount: currentPlan === 'FREE' ? "$0.00" : "$19.00", status: "Paid" },
                { date: "April 22, 2026", amount: currentPlan === 'FREE' ? "$0.00" : "$19.00", status: "Paid" }
              ].map((inv, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-zinc-900/40 last:border-0">
                  <div>
                    <p className="font-semibold text-zinc-300">{inv.date}</p>
                    <span className="text-[10px] text-zinc-500">Subscription Renew</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{inv.amount}</p>
                    <span className={`text-[10px] font-semibold ${inv.status === 'Paid' ? 'text-emerald-400' : 'text-zinc-500'}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
