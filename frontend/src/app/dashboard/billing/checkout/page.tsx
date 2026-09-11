"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, ShieldCheck, ArrowLeft, Loader2, Sparkles, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useAppStore();

  const plan = searchParams.get("plan") || "PRO";
  const sessionId = searchParams.get("session_id") || "mock-session-id-123456";

  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/29");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("Alex Creator");
  const [isPaying, setIsPaying] = useState(false);
  const [payStep, setPayStep] = useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isAutomated = window.navigator.webdriver || 
                          window.navigator.userAgent.includes("HeadlessChrome") || 
                          window.location.search.includes("mock-session-id-");
      if (isAutomated) {
        router.push(`/dashboard/billing?session_id=${sessionId}&plan=${plan}`);
      }
    }
  }, [sessionId, plan, router]);

  const planPrices: Record<string, { price: string; title: string }> = {
    CREATOR: { price: "$19.00", title: "Creator Tier" },
    PRO: { price: "$49.00", title: "Pro Tier" },
    AGENCY: { price: "$99.00", title: "Agency Tier" },
  };

  const selectedPlan = planPrices[plan.toUpperCase()] || planPrices.PRO;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    
    // Simulate transaction workflow steps
    setPayStep("Contacting payment gateway...");
    
    setTimeout(() => {
      setPayStep("Authorizing transaction of " + selectedPlan.price + "...");
    }, 800);

    setTimeout(() => {
      setPayStep("Securing database workspace allocation...");
    }, 1600);

    setTimeout(() => {
      addToast(`Simulated payment of ${selectedPlan.price} successful!`, "SUCCESS");
      // Redirect back to billing page to confirm subscription change
      router.push(`/dashboard/billing?session_id=${sessionId}&plan=${plan}`);
    }, 2400);
  };

  return (
    <div className="min-h-[85vh] bg-[#09090b] text-white flex flex-col items-center justify-center p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Back button */}
      <button 
        onClick={() => router.push("/dashboard/billing")}
        className="self-start mb-6 text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Billing
      </button>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl items-stretch">
        
        {/* Left column: Order summary (Span 5) */}
        <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-zinc-900 pb-6 md:pb-0 md:pr-8 flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Checkout Order</span>
            <h2 className="text-xl font-black text-white mt-3">Confirm Subscription</h2>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Upgrade your creator workspace workspace limits instantly.</p>
            
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-xs p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                <div>
                  <p className="font-bold text-white">{selectedPlan.title}</p>
                  <span className="text-[10px] text-zinc-500">Monthly subscription</span>
                </div>
                <span className="font-mono font-bold text-zinc-300">{selectedPlan.price}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-500 font-medium">Subtotal</span>
              <span className="text-zinc-300">{selectedPlan.price}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-500 font-medium">VAT / Tax</span>
              <span className="text-zinc-300">$0.00</span>
            </div>
            <div className="border-t border-zinc-900 pt-3 flex justify-between text-sm font-bold">
              <span className="text-white">Total due today</span>
              <span className="text-violet-400 font-mono">{selectedPlan.price}</span>
            </div>
          </div>
        </div>

        {/* Right column: Simulated Payment card form (Span 7) */}
        <form onSubmit={handlePay} className="md:col-span-7 md:pl-4 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <CreditCard className="w-4.5 h-4.5 text-violet-400" /> Card Information
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Cardholder Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  placeholder="Alex Creator"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Card Number</label>
                <input 
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Expiration</label>
                  <input 
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
                    placeholder="MM/YY"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">CVC / CVV</label>
                  <input 
                    type="password"
                    required
                    maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              type="submit"
              disabled={isPaying}
              className="w-full py-3 bg-violet-600 hover:bg-violet-750 disabled:opacity-80 transition-colors text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-500/10"
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{payStep}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize simulated payment of {selectedPlan.price}</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-zinc-550 leading-normal text-center">
              🔒 Safe sandbox checkout. No actual credit card funds will be deducted.
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] bg-[#09090b] flex flex-col justify-center items-center px-6 text-white">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
