"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Activity, TrendingUp, Users } from "lucide-react";

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

export default function AnalyticsDashboard() {
  const totalSpent = useMemo(() => {
    return MOCK_HISTORY.reduce((acc, day) => acc + day.code + day.articles + day.video, 0);
  }, []);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative z-10">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-panel p-4 rounded-2xl border-white/5">
          <div className="flex items-center gap-2 text-aura-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Total Distributed</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalSpent.toFixed(2)} USDC</div>
          <div className="text-xs text-green-400 mt-1">+12.5% this week</div>
        </div>
        
        <div className="glass-panel p-4 rounded-2xl border-white/5">
          <div className="flex items-center gap-2 text-pink-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Creators Funded</span>
          </div>
          <div className="text-2xl font-bold text-white">42</div>
          <div className="text-xs text-text-muted mt-1">Across 3 platforms</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-white/5">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Agent Actions</span>
          </div>
          <div className="text-2xl font-bold text-white">128</div>
          <div className="text-xs text-text-muted mt-1">Micro-txs executed</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="flex-1 glass-panel p-5 rounded-2xl border-white/5 flex flex-col mb-4 min-h-[250px]">
        <h3 className="text-sm font-semibold text-white mb-4">Payment Distribution by Category (7 Days)</h3>
        <div className="flex-1 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCode" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8a2be2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8a2be2" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff20', borderRadius: '12px' }}
                itemStyle={{ fontSize: '14px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="code" name="Code / Repos" stroke="#8a2be2" strokeWidth={3} fillOpacity={1} fill="url(#colorCode)" />
              <Area type="monotone" dataKey="articles" name="Articles" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorArticles)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
