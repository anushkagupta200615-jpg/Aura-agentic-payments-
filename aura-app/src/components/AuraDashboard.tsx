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
    <div className="flex flex-col h-full p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-aura-600/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-aura-400" />
              Agent Core
            </h2>
            <p className="text-text-muted text-sm mt-1">Autonomous Patron reasoning</p>
          </div>
          
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab("terminal")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "terminal" ? "bg-aura-600/20 text-aura-400 border border-aura-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <TerminalSquare className="w-4 h-4" />
              Terminal
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "analytics" ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={cn(
            "px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2",
            isAnalyzing 
              ? "bg-white/10 text-gray-400 cursor-not-allowed" 
              : "bg-aura-600 hover:bg-aura-500 text-white shadow-[0_0_20px_rgba(138,43,226,0.3)] hover:shadow-[0_0_30px_rgba(138,43,226,0.5)]"
          )}
        >
          {isAnalyzing ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Trigger Analysis
            </>
          )}
        </button>
      </div>

      {activeTab === "terminal" ? (
        <>
          <div className="p-3 mb-6 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs leading-relaxed relative z-10">
            <strong>What's happening?</strong> The Agent is tracking the time you spend hovering on content. Once you have built up some "Unprocessed Attention", click the <strong>Trigger Analysis</strong> button. The Agent will automatically calculate fair payouts and stream USDC to the creators from your Patron Budget.
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
            <div className="glass-panel p-4 rounded-2xl border-white/5">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Unprocessed Attention</p>
              <div className="text-2xl font-semibold text-white">
                {attentionLogs.length} <span className="text-sm font-normal text-gray-400">items</span>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-white/5">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Current Task</p>
              <div className="text-lg font-medium text-aura-400 flex items-center gap-2 h-8">
                {isAnalyzing ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-aura-400 animate-pulse" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    Idle. Waiting...
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 glass-panel rounded-2xl border-white/10 overflow-hidden flex flex-col relative z-10">
            <div className="bg-black/50 border-b border-white/5 p-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-mono text-gray-500">aura-agent ~ bash</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {agentLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "p-3 rounded-lg border",
                      log.type === "info" && "bg-white/5 border-white/10 text-gray-300",
                      log.type === "analysis" && "bg-aura-600/10 border-aura-500/30 text-aura-200",
                      log.type === "payment" && "bg-green-500/10 border-green-500/30 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {log.type === "info" && <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />}
                      {log.type === "analysis" && <Activity className="w-4 h-4 mt-0.5 shrink-0 text-aura-400" />}
                      {log.type === "payment" && <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-400" />}
                      
                      <div className="flex-1">
                        <div className="opacity-50 text-[10px] mb-1">
                          {new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}
                        </div>
                        {log.message}
                        
                        {log.type === "payment" && log.amount && (
                          <div className="mt-3 p-3 bg-black/40 rounded-md border border-green-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Zap className="w-3 h-3 text-green-400" />
                              </div>
                              <span className="text-gray-300 font-sans text-xs">Sent to <span className="font-bold text-white">{log.creator}</span></span>
                            </div>
                            <span className="font-bold text-green-400 font-sans">+{log.amount.toFixed(4)} USDC</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>
          </div>
        </>
      ) : (
        <AnalyticsDashboard />
      )}
    </div>
  );
}
