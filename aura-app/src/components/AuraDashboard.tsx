"use client";

import { useState, useRef, useEffect } from "react";
import { useAura } from "./AuraProvider";
import { BrainCircuit, Zap, Activity, ChevronRight, CheckCircle2, BarChart3, TerminalSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default function AuraDashboard({ onPaymentExecute }: { onPaymentExecute: (amt: number) => void }) {
  const { attentionLogs, agentLogs, addAgentLog, clearAttention } = useAura();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"terminal" | "analytics">("terminal");
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentLogs]);

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
    <div className="flex flex-col h-full p-4 sm:p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-aura-600/5 to-transparent pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-aura-400" />
              Agent Core
            </h2>
            <p className="text-text-muted text-xs sm:text-sm mt-1">Autonomous Patron reasoning</p>
          </div>
          
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            <button 
              onClick={() => setActiveTab("terminal")}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "terminal" ? "bg-aura-600/30 text-aura-300 border border-aura-500/30 shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <TerminalSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Terminal
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "analytics" ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Analytics
            </button>
          </div>
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={cn(
            "px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto",
            isAnalyzing 
              ? "bg-white/5 text-gray-400 border border-white/10 cursor-not-allowed" 
              : "bg-aura-600 hover:bg-aura-500 text-white shadow-[0_0_20px_rgba(138,43,226,0.3)] hover:shadow-[0_0_30px_rgba(138,43,226,0.5)] active:scale-95"
          )}
        >
          {isAnalyzing ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Processing Data...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-yellow-300" />
              Trigger Agent Analysis
            </>
          )}
        </button>
      </div>

      {activeTab === "terminal" ? (
        <>
          <div className="p-3 sm:p-4 mb-6 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs sm:text-sm leading-relaxed relative z-10 shadow-inner">
            <strong className="text-white">What's happening?</strong> The Agent tracks the time you spend hovering on content. Once you have built up some "Unprocessed Attention", click <strong>Trigger Agent Analysis</strong>. The AI will calculate fair payouts and autonomously stream USDC to creators.
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 relative z-10">
            <div className="bg-black/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 shadow-inner">
              <p className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Unprocessed Attention
              </p>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {attentionLogs.length} <span className="text-xs sm:text-sm font-medium text-gray-500">items</span>
              </div>
            </div>
            <div className="bg-black/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 shadow-inner">
              <p className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Agent Status
              </p>
              <div className="text-sm sm:text-lg font-bold text-aura-400 flex items-center gap-2 h-7 sm:h-8">
                {isAnalyzing ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-aura-400 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    Idle
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0a0a0c] rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden flex flex-col relative z-10 shadow-2xl">
            {/* Terminal Header */}
            <div className="bg-[#1a1b1e] border-b border-white/5 p-2.5 sm:p-3 flex items-center gap-2 shrink-0">
              <div className="flex gap-1.5 ml-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="ml-2 text-[10px] sm:text-xs font-mono text-gray-400 flex items-center gap-1.5">
                <TerminalSquare className="w-3 h-3" />
                aura-agent ~ bash
              </span>
            </div>
            
            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 font-mono text-xs sm:text-sm space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {agentLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex items-start gap-2 sm:gap-3",
                      log.type === "info" && "text-gray-400",
                      log.type === "analysis" && "text-aura-300",
                      log.type === "payment" && "text-green-400"
                    )}
                  >
                    <span className="text-gray-600 shrink-0 select-none hidden sm:inline-block">
                      {new Date(log.timestamp).toISOString().split('T')[1].slice(0, -5)}
                    </span>
                    <span className="text-aura-600 shrink-0 select-none">❯</span>
                    
                    <div className="flex-1 break-words">
                      {log.message}
                      
                      {log.type === "payment" && log.amount && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-2 mb-1 p-2 sm:p-3 bg-green-500/10 rounded-lg border border-green-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                              <Zap className="w-3 h-3 text-green-400" />
                            </div>
                            <span className="text-gray-300 font-sans text-[10px] sm:text-xs">
                              Sent to <span className="font-bold text-white break-all">{log.creator}</span>
                            </span>
                          </div>
                          <span className="font-bold text-green-400 font-sans text-xs sm:text-sm bg-green-500/10 px-2 py-1 rounded-md self-start sm:self-auto shrink-0">
                            +{log.amount.toFixed(4)} USDC
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-aura-500 font-mono text-sm">
                  <span>❯</span>
                  <span className="animate-pulse">Processing agent actions...</span>
                </div>
              )}
              <div ref={logsEndRef} className="h-2" />
            </div>
          </div>
        </>
      ) : (
        <AnalyticsDashboard />
      )}
    </div>
  );
}
