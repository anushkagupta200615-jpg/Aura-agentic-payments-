"use client";

import { useState } from "react";
import ContentFeed from "@/components/ContentFeed";
import AuraDashboard from "@/components/AuraDashboard";
import { AuraProvider } from "@/components/AuraProvider";
import { Wallet, LogOut, Sparkles, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();
  const [patronBudget, setPatronBudget] = useState(10.00);
  
  const handlePaymentExecution = (amount: number) => {
    setPatronBudget((prev) => Math.max(0, prev - amount));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-aura-600/20 via-bg-base to-bg-base pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-2xl w-full glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl shadow-aura-500/20"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-aura-600 to-pink-500 flex items-center justify-center aura-glow mb-6">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Aura <span className="text-gradient">Patron</span></h1>
            <p className="text-text-muted text-lg leading-relaxed max-w-xl mx-auto">
              The autonomous AI agent that seamlessly funds the creators you love, based purely on your genuine attention.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-10 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-aura-400 font-bold mb-2">1. Deposit</div>
              <p className="text-sm text-gray-400">Set a monthly patron budget (e.g., 10 USDC). You never have to manually click "donate" or hit a paywall again.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-pink-400 font-bold mb-2">2. Consume</div>
              <p className="text-sm text-gray-400">Read blogs, use open-source repos, or watch videos. Aura silently tracks the value you derive in the background.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-green-400 font-bold mb-2">3. Auto-Pay</div>
              <p className="text-sm text-gray-400">The Aura Agent automatically streams micro-payments to creators based on your attention span. Fair and effortless.</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <ConnectButton label="Connect Web3 Wallet to Enter Simulator" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuraProvider>
      <div className="flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-white/5 glass-panel flex items-center justify-between px-6 shrink-0 z-20 shadow-sm shadow-aura-500/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-aura-600 to-pink-500 flex items-center justify-center aura-glow">
              <span className="font-bold text-white text-sm">A</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Aura <span className="text-text-muted font-normal">Patron</span></h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-bg-surface px-4 py-2 rounded-full border border-white/10 shadow-inner">
              <Wallet className="w-4 h-4 text-aura-400" />
              <span className="font-medium text-sm text-white font-mono">
                {patronBudget.toFixed(4)} USDC
              </span>
            </div>
            
            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-3">
              <ConnectButton 
                accountStatus="address" 
                chainStatus="icon" 
                showBalance={false}
              />
            </div>
          </div>
        </header>

        {/* Split Screen Layout */}
        <div className="flex flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-aura-600/5 via-bg-base to-bg-base">
          {/* Left Side: Content Consumption */}
          <section className="w-1/2 h-full border-r border-white/5 overflow-y-auto p-6 scrollbar-hide relative z-10">
            <ContentFeed />
          </section>

          {/* Right Side: Aura Agent Dashboard */}
          <section className="w-1/2 h-full bg-black/40 relative z-10">
            <AuraDashboard onPaymentExecute={handlePaymentExecution} />
          </section>
        </div>
      </div>
    </AuraProvider>
  );
}
