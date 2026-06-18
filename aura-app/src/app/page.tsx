"use client";

import { useState, useEffect } from "react";
import ContentFeed from "@/components/ContentFeed";
import AuraDashboard from "@/components/AuraDashboard";
import { AuraProvider } from "@/components/AuraProvider";
import { Wallet, Sparkles, Eye, ArrowRight, Zap, Shield, MousePointerClick } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const stepVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.5 + i * 0.15, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const steps = [
  {
    num: 1,
    title: "You browse content",
    desc: "Read articles, explore repos, watch videos — just like normal.",
    gradient: "from-aura-600/30 to-aura-500/10",
    numBg: "bg-aura-600/30 text-aura-300",
    icon: <Eye className="w-3.5 h-3.5 text-aura-300" />,
  },
  {
    num: 2,
    title: "AI tracks your attention",
    desc: "Aura silently measures how long you engage with each piece of content.",
    gradient: "from-rose-500/20 to-rose-500/5",
    numBg: "bg-rose-500/25 text-rose-300",
    icon: <Zap className="w-3.5 h-3.5 text-rose-300" />,
  },
  {
    num: 3,
    title: "Creators get paid automatically",
    desc: "The agent distributes micro-payments from your budget — no clicks, no paywalls.",
    gradient: "from-teal-500/20 to-teal-500/5",
    numBg: "bg-teal-500/25 text-teal-300",
    icon: <Shield className="w-3.5 h-3.5 text-teal-300" />,
  },
];

/* Floating particles for the hero background */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? 'rgba(138,43,226,0.3)' : i % 3 === 1 ? 'rgba(6,182,212,0.3)' : 'rgba(244,63,94,0.2)',
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { isConnected } = useAccount();
  const [patronBudget, setPatronBudget] = useState(10.00);
  const [skippedWallet, setSkippedWallet] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "agent">("feed");
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handlePaymentExecution = (amount: number) => {
    setPatronBudget((prev) => Math.max(0, prev - amount));
  };

  // Show tooltip hint after 3 seconds on main app
  useEffect(() => {
    if (isConnected || skippedWallet) {
      const timer = setTimeout(() => setShowTooltip(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, skippedWallet]);

  if (!isConnected && !skippedWallet) {
    return (
      <div className="h-full flex items-center justify-center relative overflow-hidden px-4">
        {/* Floating particles */}
        <FloatingParticles />
        
        {/* Hero background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-aura-600/20 via-bg-base to-bg-base pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-lg w-full glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl shadow-aura-500/20"
        >
          <div className="text-center mb-8">
            {/* Hero Icon with pulsing ring */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <motion.div 
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-aura-600 via-rose-500 to-teal-500 flex items-center justify-center aura-glow"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              {/* Pulsing rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-aura-400/40"
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-teal-400/30"
                animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Aura <span className="text-gradient">Patron</span></h1>
            <p className="text-text-muted text-base leading-relaxed max-w-md mx-auto">
              An AI agent that watches what you read and automatically pays creators for the value they provide.
            </p>
          </div>

          {/* How it works - staggered step cards */}
          <div className="space-y-3 mb-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={stepVariants}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className={`flex items-start gap-4 p-3.5 rounded-xl bg-gradient-to-r ${step.gradient} border border-white/5 cursor-default group transition-colors hover:border-white/10`}
              >
                <div className={`step-number ${step.numBg} mt-0.5 relative ring-pulse`}>{step.num}</div>
                <div>
                  <div className="font-semibold text-sm text-white mb-0.5 flex items-center gap-2">
                    {step.title}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">{step.icon}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-full sm:w-auto">
              <ConnectButton label="Connect Wallet to Start" />
            </div>
            <motion.button
              onClick={() => setSkippedWallet(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-text-muted hover:text-teal-300 transition-all group bg-white/[0.03] border border-white/8 hover:border-teal-500/30 hover:bg-teal-500/5"
            >
              <MousePointerClick className="w-4 h-4 text-teal-500 group-hover:text-teal-300 transition-colors" />
              <span>Try the demo without a wallet</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuraProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Top Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-14 sm:h-16 border-b border-white/5 glass-panel flex items-center justify-between px-4 sm:px-6 shrink-0 z-20"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-aura-600 via-rose-500 to-teal-500 flex items-center justify-center shadow-lg shadow-aura-500/20"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="font-bold text-white text-sm">A</span>
            </motion.div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              Aura <span className="text-text-dim font-light">Patron</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Budget pill with animation on spend */}
            <motion.div 
              className="flex items-center gap-2 sm:gap-3 bg-bg-surface px-3 sm:px-4 py-2 rounded-full border border-white/10 hover:border-aura-500/30 transition-colors"
              whileHover={{ scale: 1.03 }}
              key={patronBudget} // re-mount on budget change to trigger animation
            >
              <Wallet className="w-4 h-4 text-teal-400" />
              <motion.span 
                initial={{ scale: 1.15, color: "#fbbf24" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ duration: 0.5 }}
                className="font-medium text-xs sm:text-sm text-white font-mono"
              >
                {patronBudget.toFixed(2)} <span className="text-text-dim">USDC</span>
              </motion.span>
            </motion.div>
            
            <div className="hidden sm:block h-6 w-px bg-white/8" />

            <div className="hidden sm:flex items-center gap-3">
              {isConnected ? (
                <ConnectButton 
                  accountStatus="address" 
                  chainStatus="icon" 
                  showBalance={false}
                />
              ) : (
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-aura-600/20 to-teal-600/20 text-aura-300 border border-aura-500/20 shimmer">
                  ✦ Demo Mode
                </span>
              )}
            </div>
          </div>
        </motion.header>

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex border-b border-white/5 shrink-0 bg-bg-surface/50 backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab("feed")}
            className={`flex-1 py-3 text-sm font-medium text-center transition-all relative ${
              activeTab === "feed" 
                ? "text-aura-400" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Eye className="w-4 h-4 mx-auto mb-1" />
            Content Feed
            {activeTab === "feed" && (
              <motion.div layoutId="mobile-tab-indicator" className="absolute bottom-0 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-aura-500 to-teal-500 rounded-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab("agent")}
            className={`flex-1 py-3 text-sm font-medium text-center transition-all relative ${
              activeTab === "agent" 
                ? "text-teal-400" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Sparkles className="w-4 h-4 mx-auto mb-1" />
            AI Agent
            {activeTab === "agent" && (
              <motion.div layoutId="mobile-tab-indicator" className="absolute bottom-0 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-teal-500 to-aura-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Desktop: Split Screen / Mobile: Tab-based — takes ALL remaining space */}
        <div className="flex flex-1 min-h-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-aura-600/5 via-bg-base to-bg-base">
          {/* Left Side: Content Consumption */}
          <section className={`${
            activeTab === "feed" ? "flex" : "hidden"
          } sm:flex flex-col w-full sm:w-1/2 h-full overflow-y-auto p-4 sm:p-6 scrollbar-hide relative z-10`}>
            <ContentFeed />
          </section>

          {/* Animated Gradient Divider (Desktop only) */}
          <div className="hidden sm:block gradient-divider-v shrink-0" />

          {/* Right Side: Aura Agent Dashboard */}
          <section className={`${
            activeTab === "agent" ? "flex" : "hidden"
          } sm:flex flex-col w-full sm:w-1/2 h-full bg-black/20 relative z-10 overflow-hidden`}>
            <AuraDashboard onPaymentExecute={handlePaymentExecution} />
          </section>
        </div>

        {/* Onboarding Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel px-5 py-3 rounded-2xl border border-aura-500/20 shadow-xl shadow-aura-500/10 flex items-center gap-3 max-w-md"
            >
              <div className="w-8 h-8 rounded-full bg-aura-600/20 flex items-center justify-center shrink-0">
                <MousePointerClick className="w-4 h-4 text-aura-400" />
              </div>
              <p className="text-xs sm:text-sm text-gray-300">
                <strong className="text-white">Hover over content cards</strong> on the left to build attention data, then click <strong className="text-teal-300">Trigger Agent Analysis</strong>!
              </p>
              <button 
                onClick={() => setShowTooltip(false)}
                className="text-gray-500 hover:text-white transition-colors text-lg shrink-0 ml-1"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuraProvider>
  );
}
