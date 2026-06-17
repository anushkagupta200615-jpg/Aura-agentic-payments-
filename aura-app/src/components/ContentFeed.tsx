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
  const { handleAttention } = useAura();
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
          handleAttention(activeItem, itemData.title, itemData.author, 100);
        }
      }, 100);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeItem, handleAttention, feedData]);

  return (
    <div className="max-w-xl mx-auto py-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          Live Feed Simulator
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-aura-400" />}
        </h2>
        
        <div className="p-4 mt-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm leading-relaxed">
          <strong>How to test:</strong> This feed is fetching <strong>LIVE Top GitHub Repositories</strong>! 
          <br/><br/>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <strong>Hover your mouse</strong> over the real repositories below. Notice how the local timer increases. You are generating real-time "Attention Data" for the Agent.
          </span>
        </div>
      </div>

      <div className="space-y-4 pb-20">
        {loading && (
          <div className="h-40 flex items-center justify-center glass-panel rounded-2xl">
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
              className={cn(
                "glass-panel rounded-2xl p-5 transition-all duration-300 relative overflow-hidden group cursor-pointer",
                isHovered ? "border-aura-500/50 shadow-[0_0_30px_rgba(138,43,226,0.15)] scale-[1.02]" : "border-white/5 hover:border-white/20"
              )}
            >
              {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-aura-600/10 to-transparent animate-in fade-in duration-300" />
              )}

              <div className="flex items-start justify-between mb-3 pl-2 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl border border-white/5 transition-colors",
                    isHovered ? "bg-aura-600/20 border-aura-500/30" : "bg-bg-base"
                  )}>
                    {item.type === "github" && <Code className="w-5 h-5 text-gray-300" />}
                    {item.type === "article" && <FileText className="w-5 h-5 text-pink-400" />}
                    {item.type === "video" && <Play className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white group-hover:text-aura-100 transition-colors">{item.title}</h3>
                    <p className="text-sm text-text-muted">by {item.author}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold font-mono transition-colors",
                    isHovered ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-gray-400 border border-white/10"
                  )}>
                    {seconds}s
                  </div>
                  {isHovered && (
                    <div className="flex items-center gap-1.5 text-[10px] text-green-400 uppercase tracking-widest animate-in fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Tracking
                    </div>
                  )}
                </div>
              </div>

              <div className="pl-2 relative z-10">
                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                {item.stars && (
                  <div className="mt-3 text-xs text-yellow-500 font-medium flex items-center gap-1">
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
