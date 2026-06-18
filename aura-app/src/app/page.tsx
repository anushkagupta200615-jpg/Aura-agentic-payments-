"use client";

import { useState } from "react";
import ContentFeed from "@/components/ContentFeed";
import AuraDashboard from "@/components/AuraDashboard";
import { AuraProvider } from "@/components/AuraProvider";
import { Wallet, Sparkles, Eye, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();
  const [patronBudget, setPatronBudget] = useState(10.00);
  const [skippedWallet, setSkippedWallet] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "agent">("feed");
  
  const handlePaymentExecution = (amount: number) => {
    setPatronBudget((prev) => Math.max(0, prev - amount));
  };

  if (!isConnected && !skippedWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-aura-600/20 via-bg-base to-bg-base pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-lg w-full glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl shadow-aura-500/20"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-aura-600 to-pink-500 flex items-center justify-center aura-glow mb-6">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Aura <span className="text-gradient">Patron</span></h1>
            <p className="text-text-muted text-base leading-relaxed max-w-md mx-auto">
              An AI agent that watches what you read and automatically pays creators for the value they provide.
            </p>
          </div>

          {/* How it works - vertical steps for clarity */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="step-number bg-aura-600/30 text-aura-300 mt-0.5">1</div>
              <div>
                <div className="font-semibold text-sm text-white mb-0.5">You browse content</div>
                <p className="text-xs text-gray-400 leading-relaxed">Read articles, explore repos, watch videos — just like normal.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="step-number bg-pink-500/30 text-pink-300 mt-0.5">2</div>
              <div>
                <div className="font-semibold text-sm text-white mb-0.5">AI tracks your attention</div>
                <p className="text-xs text-gray-400 leading-relaxed">Aura silently measures how long you engage with each piece of content.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="step-number bg-green-500/30 text-green-300 mt-0.5">3</div>
              <div>
                <div className="font-semibold text-sm text-white mb-0.5">Creators get paid automatically</div>
                <p className="text-xs text-gray-400 leading-relaxed">The agent distributes micro-payments from your budget — no clicks, no paywalls.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <ConnectButton label="Connect Wallet to Start" />
            <button
              onClick={() => setSkippedWallet(true)}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-all group"
            >
              Try the demo without a wallet 
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuraProvider>
      <div className="flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-14 sm:h-16 border-b border-white/5 glass-panel flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-aura-600 to-pink-500 flex items-center justify-center aura-glow">
              <span className="font-bold text-white text-sm">A</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Aura <span className="text-text-muted font-normal">Patron</span></h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 bg-bg-surface px-3 sm:px-4 py-2 rounded-full border border-white/10">
              <Wallet className="w-4 h-4 text-aura-400" />
              <span className="font-medium text-xs sm:text-sm text-white font-mono">
                {patronBudget.toFixed(2)} <span className="text-text-muted">USDC</span>
              </span>
            </div>
            
            <div className="hidden sm:block h-6 w-px bg-white/10" />

            <div className="hidden sm:flex items-center gap-3">
              {isConnected ? (
                <ConnectButton 
                  accountStatus="address" 
                  chainStatus="icon" 
                  showBalance={false}
                />
              ) : (
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-aura-600/20 text-aura-300 border border-aura-500/30">
                  Demo Mode
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex border-b border-white/5 shrink-0">
          <button 
            onClick={() => setActiveTab("feed")}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === "feed" 
                ? "text-aura-400 border-b-2 border-aura-500" 
                : "text-gray-500"
            }`}
          >
            <Eye className="w-4 h-4 mx-auto mb-1" />
            Content Feed
          </button>
          <button 
            onClick={() => setActiveTab("agent")}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === "agent" 
                ? "text-aura-400 border-b-2 border-aura-500" 
                : "text-gray-500"
            }`}
          >
            <Sparkles className="w-4 h-4 mx-auto mb-1" />
            AI Agent
          </button>
        </div>

        {/* Desktop: Split Screen Layout / Mobile: Tab-based */}
        <div className="flex flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-aura-600/5 via-bg-base to-bg-base">
          {/* Left Side: Content Consumption */}
          <section className={`${
            activeTab === "feed" ? "block" : "hidden"
          } sm:block w-full sm:w-1/2 h-full border-r border-white/5 overflow-y-auto p-4 sm:p-6 scrollbar-hide relative z-10`}>
            <ContentFeed />
          </section>

          {/* Right Side: Aura Agent Dashboard */}
          <section className={`${
            activeTab === "agent" ? "block" : "hidden"
          } sm:block w-full sm:w-1/2 h-full bg-black/20 relative z-10 overflow-y-auto`}>
            <AuraDashboard onPaymentExecute={handlePaymentExecution} />
          </section>
        </div>
      </div>
    </AuraProvider>
  );
}
