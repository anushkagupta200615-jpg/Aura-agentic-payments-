"use client";

import { useEffect, useRef, useState } from "react";
import { useAura } from "./AuraProvider";
import { Code, Play, FileText, RefreshCw, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FeedItem {
  id: string;
  type: "github" | "article" | "video";
  title: string;
  author: string;
  description: string;
  stars?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const typeConfig = {
  github: {
    icon: Code,
    color: "text-aura-300",
    dimColor: "text-aura-500",
    bgActive: "bg-aura-600/20 border-aura-500/40",
    bgIdle: "bg-bg-base border-white/5",
    glowColor: "rgba(138, 43, 226, 0.2)",
    gradientFrom: "from-aura-600/20",
  },
  article: {
    icon: FileText,
    color: "text-rose-300",
    dimColor: "text-rose-500",
    bgActive: "bg-rose-500/15 border-rose-500/30",
    bgIdle: "bg-bg-base border-white/5",
    glowColor: "rgba(244, 63, 94, 0.2)",
    gradientFrom: "from-rose-500/15",
  },
  video: {
    icon: Play,
    color: "text-teal-300",
    dimColor: "text-teal-500",
    bgActive: "bg-teal-500/15 border-teal-500/30",
    bgIdle: "bg-bg-base border-white/5",
    glowColor: "rgba(6, 182, 212, 0.2)",
    gradientFrom: "from-teal-500/15",
  },
};

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

  const getProgressPercent = (timeMs: number) => {
    // Cap at 10s for the progress bar visualization
    return Math.min((timeMs / 10000) * 100, 100);
  };

  return (
    <div className="max-w-xl mx-auto py-2 sm:py-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-3">
          Content Feed Simulator
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-aura-400" />
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              <Radio className="w-3 h-3" />
              Live
            </span>
          )}
        </h2>
        
        <div className="p-4 mt-4 rounded-xl bg-gradient-to-r from-aura-600/10 to-teal-600/5 border border-aura-500/15 text-aura-100 text-xs sm:text-sm leading-relaxed">
          <strong className="text-white block mb-1.5">How it works:</strong>
          This feed is populated with real-time top GitHub Repositories.
          <div className="mt-3 flex items-start sm:items-center gap-2.5 bg-white/[0.03] rounded-lg px-3 py-2">
            <span className="w-2 h-2 mt-1 sm:mt-0 rounded-full bg-teal-400 animate-pulse shrink-0" />
            <span><strong className="text-teal-300">Hover your mouse</strong> (or tap on mobile) over the cards below. The local timer will increase, generating &quot;Attention Data&quot; for the Agent.</span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4 pb-6">
        {loading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 glass-panel rounded-2xl shimmer" style={{ animationDelay: `${i * 200}ms` }} />
            ))}
          </div>
        )}
        
        <AnimatePresence>
          {!loading && feedData.map((item, index) => {
            const isHovered = activeItem === item.id;
            const timeSpent = localTimes[item.id] || 0;
            const seconds = (timeSpent / 1000).toFixed(1);
            const progress = getProgressPercent(timeSpent);
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <motion.div 
                key={item.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                layout
                onMouseEnter={() => setActiveItem(item.id)}
                onMouseLeave={() => setActiveItem(null)}
                // For mobile support
                onClick={() => setActiveItem(isHovered ? null : item.id)}
                className={cn(
                  "glass-panel rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden group cursor-pointer card-hover-lift gradient-border",
                  isHovered ? "border-aura-500/40" : "border-white/5"
                )}
                style={isHovered ? { boxShadow: `0 0 30px ${config.glowColor}, 0 8px 32px rgba(0,0,0,0.4)` } : undefined}
              >
                {/* Active gradient overlay */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`absolute inset-0 bg-gradient-to-r ${config.gradientFrom} via-transparent to-transparent pointer-events-none`}
                    />
                  )}
                </AnimatePresence>

                <div className="flex items-start justify-between mb-3 relative z-10 gap-2">
                  <div className="flex items-start sm:items-center gap-3">
                    <motion.div 
                      className={cn(
                        "p-2.5 rounded-xl border transition-all duration-300 shrink-0",
                        isHovered ? config.bgActive + " shadow-inner" : config.bgIdle
                      )}
                      animate={isHovered ? { rotate: [0, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className={cn("w-5 h-5", isHovered ? config.color : config.dimColor)} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-white group-hover:text-aura-100 transition-colors leading-tight mb-0.5">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-text-muted">by <span className="text-gray-300">{item.author}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <motion.div 
                      className={cn(
                        "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all duration-300",
                        isHovered 
                          ? "bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]" 
                          : "bg-black/30 text-gray-500 border border-white/10"
                      )}
                      animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0, repeatDelay: 0.5 }}
                    >
                      {seconds}s
                    </motion.div>
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-1.5 text-[10px] sm:text-xs text-teal-400 uppercase tracking-widest font-semibold"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                          Tracking
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="relative z-10 mt-2 sm:mt-0 sm:pl-[3.25rem]">
                  <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  {item.stars && (
                    <div className="mt-2.5 text-[11px] sm:text-xs text-amber-400/80 font-medium flex items-center gap-1.5">
                      <motion.span 
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        ★
                      </motion.span>
                      {item.stars.toLocaleString()} stars
                    </div>
                  )}
                </div>

                {/* Attention Progress Bar */}
                {timeSpent > 0 && (
                  <div className="relative z-10 mt-3 sm:ml-[3.25rem]">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full bg-gradient-to-r from-aura-500 via-teal-500 to-aura-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-text-dim">Attention</span>
                      <span className="text-[9px] text-text-dim">{progress.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
