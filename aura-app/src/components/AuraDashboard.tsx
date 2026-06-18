"use client";

import { useState, useRef, useEffect } from "react";
import { useAura } from "./AuraProvider";
import { BrainCircuit, Zap, Activity, CheckCircle2, BarChart3, TerminalSquare, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AnalyticsDashboard from "./AnalyticsDashboard";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-aura-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

function PaymentSuccessIcon() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-green-400 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
    </motion.div>
  );
}

const tabSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
};

export default function AuraDashboard({ onPaymentExecute }: { onPaymentExecute: (amt: number) => void }) {
  const { attentionLogs, agentLogs, addAgentLog, clearAttention } = useAura();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"terminal" | "analytics">("terminal");
  const [tabDirection, setTabDirection] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentLogs]);

  const handleTabSwitch = (tab: "terminal" | "analytics") => {
    setTabDirection(tab === "analytics" ? 1 : -1);
    setActiveTab(tab);
  };

  const handleAnalyze = async () => {
    if (attentionLogs.length === 0) {
      addAgentLog("No significant attention detected. Nothing to analyze.", "info");
      return;
    }

    setIsAnalyzing(true);
    addAgentLog("Sending telemetry to Aura Agent Backend...", "analysis");

    try {
      const res = await fetch("/api/agent/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: attentionLogs })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        addAgentLog(data.message || "Attention below threshold.", "info");
        setIsAnalyzing(false);
        clearAttention();
        return;
      }

      addAgentLog(data.message, "analysis");

      if (data.payouts && data.payouts.length > 0) {
        data.payouts.forEach((payout: any, index: number) => {
          setTimeout(async () => {
            addAgentLog(`Initiating smart contract execution for ${payout.title}...`, "info");
            
            const execRes = await fetch("/api/payments/execute", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ payout })
            });
            const execData = await execRes.json();
            
            if (execData.success) {
              addAgentLog(`Tx Hash: ${execData.txHash} confirmed.`, "payment", payout.amount, payout.creator);
              onPaymentExecute(payout.amount);
            }
          }, index * 1200);
        });

        setTimeout(() => {
          setIsAnalyzing(false);
          clearAttention();
          addAgentLog("Distribution complete. Waiting for new attention data.", "info");
        }, data.payouts.length * 1200 + 500);
      }
    } catch (error) {
      addAgentLog("Error connecting to Agent API.", "info");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 relative scrollbar-hide">
      <div className="absolute inset-0 bg-gradient-to-br from-aura-600/5 via-transparent to-teal-600/3 pointer-events-none" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: isAnalyzing ? 360 : 0 }}
                transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
              >
                <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-aura-400" />
              </motion.div>
              Agent Core
            </h2>
            <p className="text-text-dim text-xs sm:text-sm mt-1">Autonomous Patron reasoning</p>
          </div>
          
          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/8 self-start sm:self-auto">
            <button 
              onClick={() => handleTabSwitch("terminal")}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2",
                activeTab === "terminal" 
                  ? "bg-gradient-to-r from-aura-600/30 to-aura-600/15 text-aura-300 border border-aura-500/25 shadow-lg shadow-aura-500/10" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              )}
            >
              <TerminalSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Terminal
            </button>
            <button 
              onClick={() => handleTabSwitch("analytics")}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2",
                activeTab === "analytics" 
                  ? "bg-gradient-to-r from-teal-500/20 to-teal-500/10 text-teal-300 border border-teal-500/25 shadow-lg shadow-teal-500/10" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Analytics
            </button>
          </div>
        </div>

        {/* Trigger Button */}
        <motion.button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          whileHover={!isAnalyzing ? { scale: 1.03 } : {}}
          whileTap={!isAnalyzing ? { scale: 0.97 } : {}}
          className={cn(
            "px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto relative overflow-hidden",
            isAnalyzing 
              ? "bg-white/5 text-gray-500 border border-white/8 cursor-not-allowed shimmer" 
              : "animated-gradient-bg text-white shadow-[0_0_25px_rgba(138,43,226,0.3),0_0_50px_rgba(6,182,212,0.1)] hover:shadow-[0_0_35px_rgba(138,43,226,0.45),0_0_70px_rgba(6,182,212,0.15)]"
          )}
        >
          {isAnalyzing ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Processing<TypingDots />
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300" />
              Trigger Agent Analysis
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Tab Content with AnimatePresence */}
      <AnimatePresence mode="wait" custom={tabDirection}>
        {activeTab === "terminal" ? (
          <motion.div
            key="terminal"
            custom={tabDirection}
            variants={tabSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Info Banner */}
            <div className="p-3 sm:p-4 mb-6 rounded-xl bg-gradient-to-r from-aura-500/10 to-teal-500/5 border border-aura-500/15 text-aura-100 text-xs sm:text-sm leading-relaxed relative z-10">
              <strong className="text-white">What&apos;s happening?</strong> The Agent tracks the time you spend hovering on content. Once you have built up some &quot;Unprocessed Attention&quot;, click <strong className="text-teal-300">Trigger Agent Analysis</strong>. The AI will calculate fair payouts and autonomously stream USDC to creators.
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 relative z-10">
              <motion.div 
                className="bg-black/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/8 card-hover-lift"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-[10px] sm:text-xs text-text-dim font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-aura-400" /> Unprocessed Attention
                </p>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  <AnimatedCounter value={attentionLogs.length} /> <span className="text-xs sm:text-sm font-medium text-text-dim">items</span>
                </div>
              </motion.div>
              <motion.div 
                className={cn(
                  "p-3 sm:p-4 rounded-xl sm:rounded-2xl border card-hover-lift transition-all duration-500",
                  isAnalyzing 
                    ? "bg-gradient-to-br from-aura-600/15 to-teal-600/10 border-aura-500/20" 
                    : "bg-black/50 border-white/8"
                )}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-[10px] sm:text-xs text-text-dim font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" /> Agent Status
                </p>
                <div className="text-sm sm:text-lg font-bold flex items-center gap-2 h-7 sm:h-8">
                  {isAnalyzing ? (
                    <span className="text-aura-400 flex items-center gap-2">
                      <motion.div 
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-aura-400 to-teal-400"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                      Analyzing<TypingDots />
                    </span>
                  ) : (
                    <span className="text-text-dim flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-600" />
                      Idle
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Terminal */}
            <div className="flex-1 bg-[#08080c] rounded-xl sm:rounded-2xl border border-white/8 overflow-hidden flex flex-col relative z-10 shadow-2xl shadow-black/50">
              {/* Terminal Header */}
              <div className="bg-[#111116] border-b border-white/5 p-2.5 sm:p-3 flex items-center gap-2 shrink-0">
                <div className="flex gap-1.5 ml-1">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56] hover:brightness-110 transition" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 transition" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f] hover:brightness-110 transition" />
                </div>
                <span className="ml-2 text-[10px] sm:text-xs font-mono text-gray-500 flex items-center gap-1.5">
                  <TerminalSquare className="w-3 h-3" />
                  aura-agent ~ bash
                </span>
                {isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-auto flex items-center gap-1.5 text-[10px] text-aura-400"
                  >
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>Processing</span>
                  </motion.div>
                )}
              </div>
              
              {/* Terminal Body */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 font-mono text-xs sm:text-sm space-y-3 scrollbar-hide">
                <AnimatePresence initial={false}>
                  {agentLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -15, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className={cn(
                        "flex items-start gap-2 sm:gap-3",
                        log.type === "info" && "text-gray-500",
                        log.type === "analysis" && "text-aura-300",
                        log.type === "payment" && "text-teal-300"
                      )}
                    >
                      <span className="text-gray-700 shrink-0 select-none hidden sm:inline-block text-[10px]">
                        {new Date(log.timestamp).toISOString().split('T')[1].slice(0, -5)}
                      </span>
                      <span className={cn(
                        "shrink-0 select-none",
                        log.type === "payment" ? "text-teal-500" : "text-aura-600"
                      )}>❯</span>
                      
                      <div className="flex-1 break-words">
                        {log.message}
                        
                        {log.type === "payment" && log.amount && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.92, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                            className="mt-2 mb-1 p-2.5 sm:p-3 bg-gradient-to-r from-teal-500/10 to-green-500/5 rounded-xl border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <PaymentSuccessIcon />
                              <span className="text-gray-300 font-sans text-[10px] sm:text-xs">
                                Sent to <span className="font-bold text-white break-all">{log.creator}</span>
                              </span>
                            </div>
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                              className="font-bold text-teal-400 font-sans text-xs sm:text-sm bg-teal-500/10 px-2.5 py-1 rounded-lg self-start sm:self-auto shrink-0 border border-teal-500/15"
                            >
                              +{log.amount.toFixed(4)} USDC
                            </motion.span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-aura-500 font-mono text-sm"
                  >
                    <span>❯</span>
                    <span>Processing agent actions<TypingDots /></span>
                  </motion.div>
                )}
                <div ref={logsEndRef} className="h-2" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analytics"
            custom={tabDirection}
            variants={tabSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 min-h-0"
          >
            <AnalyticsDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
