"use client";

import { useEffect, useRef, useState } from "react";
import { useAura } from "./AuraProvider";
import { Code, Play, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedItem {
  id: string;
  type: "github" | "article" | "video";
  title: string;
  author: string;
  description: string;
  stars?: number;
}

export default function ContentFeed() {
  const { addAttention } = useAura();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [localTimes, setLocalTimes] = useState<Record<string, number>>({});
  const [feedData, setFeedData] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Timer Reference
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Live Data from GitHub API to make the simulator realistic
  useEffect(() => {
    const fetchLiveData = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://api.github.com/search/repositories?q=language:typescript+stars:>5000&sort=stars&order=desc&per_page=5");
        const data = await res.json();
        
        if (data.items) {
          const liveRepos = data.items.map((repo: any) => ({
            id: repo.id.toString(),
            type: "github",
            title: repo.full_name,
            author: repo.owner.login,
            description: repo.description,
            stars: repo.stargazers_count,
          }));

          // Mix in some static articles/videos for variety
          setFeedData([
            ...liveRepos,
            { id: "vid-1", type: "video", title: "Agentic Payments Explained", author: "Team1 Speedrun", description: "A deep dive into how AI agents will shape the future of micro-transactions." },
            { id: "art-1", type: "article", title: "The End of Paywalls", author: "Aura Creator", description: "Why autonomous patronage is better than subscriptions." }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch live data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLiveData();
  }, []);

  useEffect(() => {
    if (activeItem) {
      intervalRef.current = setInterval(() => {
        setLocalTimes((prev) => ({
          ...prev,
          [activeItem]: (prev[activeItem] || 0) + 100, // +100ms
        }));
        
        // Find the active item data to send to the global provider
        const itemData = feedData.find(i => i.id === activeItem);
        if (itemData) {
          addAttention(activeItem, itemData.title, itemData.author, 100);
        }
      }, 100);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeItem, addAttention, feedData]);

  return (
    <div className="max-w-xl mx-auto py-2 sm:py-4">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-3">
          Content Feed Simulator
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-aura-400" />}
        </h2>
        
        <div className="p-4 mt-4 rounded-xl bg-aura-600/10 border border-aura-500/20 text-aura-100 text-xs sm:text-sm leading-relaxed shadow-inner">
          <strong className="text-white block mb-1">How it works:</strong>
          This feed is populated with real-time top GitHub Repositories.
          <br/><br/>
          <span className="flex items-start sm:items-center gap-2">
            <span className="w-2 h-2 mt-1 sm:mt-0 rounded-full bg-aura-400 animate-pulse shrink-0" />
            <span><strong>Hover your mouse</strong> (or tap on mobile) over the cards below. The local timer will increase, generating "Attention Data" for the Agent.</span>
          </span>
        </div>
      </div>

      <div className="space-y-4 pb-20">
        {loading && (
          <div className="h-40 flex items-center justify-center glass-panel rounded-2xl shimmer">
            <RefreshCw className="w-6 h-6 animate-spin text-aura-400" />
          </div>
        )}
        
        {!loading && feedData.map((item) => {
          const isHovered = activeItem === item.id;
          const timeSpent = localTimes[item.id] || 0;
          const seconds = (timeSpent / 1000).toFixed(1);

          return (
            <div 
              key={item.id}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
              // For mobile support
              onClick={() => setActiveItem(isHovered ? null : item.id)}
              className={cn(
                "glass-panel rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden group cursor-pointer",
                isHovered ? "border-aura-500/50 pulse-glow scale-[1.02]" : "border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
              )}
            >
              {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-aura-600/20 via-transparent to-transparent animate-in fade-in duration-300 pointer-events-none" />
              )}

              <div className="flex items-start justify-between mb-3 relative z-10 gap-2">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl border transition-all duration-300 shrink-0",
                    isHovered ? "bg-aura-600/20 border-aura-500/40 shadow-inner" : "bg-bg-base border-white/5"
                  )}>
                    {item.type === "github" && <Code className={cn("w-5 h-5", isHovered ? "text-aura-300" : "text-gray-400")} />}
                    {item.type === "article" && <FileText className={cn("w-5 h-5", isHovered ? "text-pink-300" : "text-pink-500")} />}
                    {item.type === "video" && <Play className={cn("w-5 h-5", isHovered ? "text-blue-300" : "text-blue-500")} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-white group-hover:text-aura-100 transition-colors leading-tight mb-0.5">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-text-muted">by <span className="text-gray-300">{item.author}</span></p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className={cn(
                    "px-2 sm:px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all duration-300",
                    isHovered 
                      ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
                      : "bg-black/30 text-gray-400 border border-white/10"
                  )}>
                    {seconds}s
                  </div>
                  {isHovered && (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-green-400 uppercase tracking-widest font-semibold animate-in fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                      Tracking
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 mt-2 sm:mt-0 sm:pl-[3.25rem]">
                <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                {item.stars && (
                  <div className="mt-2.5 text-[11px] sm:text-xs text-yellow-500/80 font-medium flex items-center gap-1">
                    ★ {item.stars.toLocaleString()} stars
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
