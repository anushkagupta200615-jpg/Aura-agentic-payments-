"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type AttentionLog = {
  id: string;
  title: string;
  creator: string;
  timeSpentMs: number;
};

export type AgentLog = {
  id: string;
  message: string;
  timestamp: number;
  type: "info" | "analysis" | "payment";
  amount?: number;
  creator?: string;
};

interface AuraContextType {
  attentionLogs: AttentionLog[];
  agentLogs: AgentLog[];
  addAttention: (id: string, title: string, creator: string, ms: number) => void;
  addAgentLog: (message: string, type: AgentLog["type"], amount?: number, creator?: string) => void;
  clearAttention: () => void;
}

const AuraContext = createContext<AuraContextType | undefined>(undefined);

export function AuraProvider({ children }: { children: React.ReactNode }) {
  const [attentionLogs, setAttentionLogs] = useState<AttentionLog[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([
    {
      id: "init",
      message: "Aura Agent initialized. Monitoring patron attention...",
      timestamp: Date.now(),
      type: "info",
    },
  ]);

  const addAttention = useCallback((id: string, title: string, creator: string, ms: number) => {
    setAttentionLogs((prev) => {
      const existing = prev.find((log) => log.id === id);
      if (existing) {
        return prev.map((log) =>
          log.id === id ? { ...log, timeSpentMs: log.timeSpentMs + ms } : log
        );
      }
      return [...prev, { id, title, creator, timeSpentMs: ms }];
    });
  }, []);

  const addAgentLog = useCallback(
    (message: string, type: AgentLog["type"], amount?: number, creator?: string) => {
      setAgentLogs((prev) => [
        {
          id: Math.random().toString(36).substring(7),
          message,
          timestamp: Date.now(),
          type,
          amount,
          creator,
        },
        ...prev,
      ]);
    },
    []
  );

  const clearAttention = useCallback(() => {
    setAttentionLogs([]);
  }, []);

  return (
    <AuraContext.Provider value={{ attentionLogs, agentLogs, addAttention, addAgentLog, clearAttention }}>
      {children}
    </AuraContext.Provider>
  );
}

export function useAura() {
  const context = useContext(AuraContext);
  if (!context) throw new Error("useAura must be used within AuraProvider");
  return context;
}
