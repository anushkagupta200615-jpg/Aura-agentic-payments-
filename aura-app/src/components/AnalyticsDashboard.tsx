"use client";

import { useMemo, useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

// Mock historical data for the beautiful Recharts display
const MOCK_HISTORY = [
  { name: "Mon", code: 0.12, articles: 0.05, video: 0.02 },
  { name: "Tue", code: 0.25, articles: 0.08, video: 0.01 },
  { name: "Wed", code: 0.18, articles: 0.15, video: 0.05 },
  { name: "Thu", code: 0.40, articles: 0.12, video: 0.04 },
  { name: "Fri", code: 0.35, articles: 0.20, video: 0.08 },
  { name: "Sat", code: 0.55, articles: 0.25, video: 0.15 },
  { name: "Sun", code: 0.45, articles: 0.30, video: 0.10 },
];

function AnimatedNumber({ value, decimals = 2, prefix = "" }: { value: number; decimals?: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toFixed(decimals)}</>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const statCards = [
  {
    icon: TrendingUp,
    iconColor: "text-aura-400",
    glowColor: "hover:shadow-aura-500/10",
    gradientBorder: "from-aura-500/30 to-aura-600/10",
    label: "Total Distributed",
    suffix: " USDC",
    subtext: "+12.5% this week",
    subtextColor: "text-teal-400",
  },
  {
    icon: Users,
    iconColor: "text-rose-400",
    glowColor: "hover:shadow-rose-500/10",
    gradientBorder: "from-rose-500/30 to-rose-600/10",
    label: "Creators Funded",
    value: 42,
    subtext: "Across 3 platforms",
    subtextColor: "text-text-dim",
  },
  {
    icon: Activity,
    iconColor: "text-teal-400",
    glowColor: "hover:shadow-teal-500/10",
    gradientBorder: "from-teal-500/30 to-teal-600/10",
    label: "Agent Actions",
    value: 128,
    subtext: "Micro-txs executed",
    subtextColor: "text-text-dim",
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel px-4 py-3 rounded-xl border border-white/10 shadow-xl">
        <p className="text-xs text-text-muted mb-2 font-semibold">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-sm mb-0.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="font-bold text-white">${entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const totalSpent = useMemo(() => {
    return MOCK_HISTORY.reduce((acc, day) => acc + day.code + day.articles + day.video, 0);
  }, []);

  return (
    <div className="flex flex-col h-full relative z-10">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className={`glass-panel p-3 sm:p-4 rounded-2xl border-white/5 card-hover-lift transition-shadow ${card.glowColor} hover:shadow-lg cursor-default`}
            >
              <div className={`flex items-center gap-2 ${card.iconColor} mb-2`}>
                <Icon className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">{card.label}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {card.label === "Total Distributed" ? (
                  <AnimatedNumber value={totalSpent} prefix="" />
                ) : (
                  <AnimatedNumber value={card.value!} decimals={0} />
                )}
                {card.suffix && <span className="text-sm font-medium text-text-dim ml-1">{card.suffix}</span>}
              </div>
              <div className={`text-[10px] sm:text-xs mt-1.5 ${card.subtextColor}`}>{card.subtext}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex-1 glass-panel p-4 sm:p-5 rounded-2xl border-white/5 flex flex-col mb-4 min-h-[250px]"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          Payment Distribution by Category
          <span className="text-[10px] text-text-dim font-normal bg-white/5 px-2 py-0.5 rounded-full">7 Days</span>
        </h3>
        <div className="flex-1 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCode" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8a2be2" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#8a2be2" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff30" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff30" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="code" name="Code / Repos" stroke="#8a2be2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCode)" />
              <Area type="monotone" dataKey="articles" name="Articles" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorArticles)" />
              <Area type="monotone" dataKey="video" name="Videos" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVideo)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
