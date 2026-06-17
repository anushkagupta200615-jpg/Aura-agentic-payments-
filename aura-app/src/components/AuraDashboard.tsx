"use client";

import { useAura } from "./AuraProvider";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Activity, ChevronRight, Zap, Coins } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AuraDashboard({ onPaymentExecute }: { onPaymentExecute: (amt: number) => void }) {
  const { attentionLogs, agentLogs, addAgentLog, clearAttention } = useAura();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (attentionLogs.length === 0) {
      addAgentLog("No significant attention detected. Nothing to analyze.", "info");
      return;
    }

    setIsAnalyzing(true);
    addAgentLog("Sending telemetry to Aura Agent Backend...", "analysis");

    try {
      // 1. Call Analysis API
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

      // 2. Execute Payments
      if (data.payouts && data.payouts.length > 0) {
        data.payouts.forEach((payout: any, index: number) => {
          setTimeout(async () => {
            addAgentLog(`Initiating smart contract execution for ${payout.title}...`, "info");
            
            // 3. Call Execution API
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
          }, index * 1200); // Stagger
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
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-aura-600/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-aura-400" />
            Agent Core
          </h2>
          <p className="text-text-muted text-sm mt-1">Autonomous Patron reasoning & execution</p>
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

      <div className="p-3 mb-6 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs leading-relaxed relative z-10">
        <strong>What's happening?</strong> The Agent is tracking the time you spend hovering on content. Once you have built up some "Unprocessed Attention", click the <strong>Trigger Analysis</strong> button. The Agent will automatically calculate fair payouts and stream USDC to the creators from your Patron Budget.
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="glass-panel p-4 rounded-2xl border-white/5">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Unprocessed Attention</p>
          <div className="text-2xl font-semibold text-white">
            {(attentionLogs.reduce((acc, curr) => acc + curr.timeSpentMs, 0) / 1000).toFixed(1)} <span className="text-sm text-gray-500 font-normal">sec</span>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border-white/5">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Active Creators</p>
          <div className="text-2xl font-semibold text-white">
            {new Set(attentionLogs.map(l => l.creator)).size}
          </div>
        </div>
      </div>

      {/* Terminal / Logs Area */}
      <div className="flex-1 glass-panel rounded-2xl border border-white/10 p-5 flex flex-col overflow-hidden relative z-10">
        <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-4 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-500 font-mono ml-2">aura_agent_stdout.log</span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col-reverse space-y-reverse space-y-3 pb-4 pr-2">
          <AnimatePresence initial={false}>
            {agentLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "p-3 rounded-xl text-sm border font-mono",
                  log.type === "info" ? "bg-white/5 border-transparent text-gray-300" : "",
                  log.type === "analysis" ? "bg-blue-500/10 border-blue-500/20 text-blue-300" : "",
                  log.type === "payment" ? "bg-green-500/10 border-green-500/30 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : ""
                )}
              >
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                  <div className="flex-1">
                    <div className="opacity-50 text-[10px] mb-1">
                      {new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}
                    </div>
                    {log.message}
                    
                    {log.type === "payment" && log.amount && (
                      <div className="mt-2 flex items-center justify-between p-2 rounded bg-black/40 border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="text-white font-sans">{log.amount.toFixed(4)} USDC</span>
                        </div>
                        <span className="text-xs text-gray-400 font-sans">to {log.creator}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
