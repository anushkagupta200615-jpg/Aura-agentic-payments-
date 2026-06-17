"use client";

import { useEffect, useRef, useState } from "react";
import { useAura } from "./AuraProvider";
import { Code, Play, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_CONTENT = [
  {
    id: "repo-1",
    type: "github",
    title: "team1-network/speedrun-sdk",
    creator: "0xTeam1Dev",
    desc: "The official SDK for building fast on Avalanche.",
    tags: ["typescript", "web3"],
  },
  {
    id: "article-1",
    type: "article",
    title: "Why Agentic Payments are the Future of Web3",
    creator: "0xAliceCrypto",
    desc: "An in-depth look at how AI agents are changing the way we transact on-chain.",
    tags: ["essay", "ai", "crypto"],
  },
  {
    id: "video-1",
    type: "video",
    title: "Building an Autonomous Agent in 10 Minutes",
    creator: "0xBobBuilder",
    desc: "A quick tutorial on the Vercel AI SDK and viem.",
    tags: ["tutorial", "video"],
  },
];

function ContentCard({ item }: { item: typeof MOCK_CONTENT[0] }) {
  const { addAttention } = useAura();
  const [isActive, setIsActive] = useState(false);
  const [localTime, setLocalTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Track attention when mouse enters/leaves to simulate "reading" or "watching"
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setLocalTime((prev) => prev + 1);
        // Send to global agent context every second (1000ms)
        addAttention(item.id, item.title, item.creator, 1000);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, item, addAttention]);

  return (
    <div 
      className={cn(
        "p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer",
        isActive ? "bg-white/5 border-aura-500/50 aura-glow" : "glass-panel border-white/5 hover:border-white/10"
      )}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      {/* Active Indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full transition-all duration-300",
        isActive ? "bg-aura-400" : "bg-transparent"
      )} />

      <div className="flex items-start justify-between mb-3 pl-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-bg-base border border-white/5">
            {item.type === "github" && <Code className="w-5 h-5 text-gray-300" />}
            {item.type === "article" && <FileText className="w-5 h-5 text-blue-400" />}
            {item.type === "video" && <Play className="w-5 h-5 text-red-400" />}
          </div>
          <div>
            <h3 className="font-medium text-text-main group-hover:text-aura-400 transition-colors">{item.title}</h3>
            <p className="text-xs text-text-muted mt-0.5">by <span className="text-gray-300">{item.creator}</span></p>
          </div>
        </div>
        
        {isActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-aura-500/10 border border-aura-500/20 text-aura-400 text-xs font-medium animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-aura-400" />
            Tracking
          </div>
        )}
      </div>

      <p className="text-sm text-text-muted pl-2 mb-4 line-clamp-2 leading-relaxed">
        {item.desc}
      </p>

      <div className="flex items-center justify-between pl-2">
        <div className="flex gap-2">
          {item.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 font-mono">
          {localTime}s
        </div>
      </div>
    </div>
  );
}

export default function ContentFeed() {
  return (
    <div className="max-w-xl mx-auto py-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Simulated Feed</h2>
        
        <div className="p-4 mt-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm leading-relaxed">
          <strong>How to test:</strong> Pretend this is your normal internet feed. 
          <br/><br/>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <strong>Hover your mouse</strong> over the cards below to simulate reading or watching. Notice how the local timer increases. You are generating "Attention Data" for the Agent to process.
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_CONTENT.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
      
      <div className="mt-12 p-6 rounded-2xl glass-panel border-dashed border-white/10 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-8 h-8 text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm">You have reached the end of your feed.</p>
      </div>
    </div>
  );
}
