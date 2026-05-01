"use client";

import { useState } from "react";
import { Star, Radio, Play } from "lucide-react";

export function ChannelLibrary() {
  const [activeTab, setActiveTab] = useState("favorites");
  
  const tabs = [
    { id: "favorites", label: "⭐ Favorites" },
    { id: "recent", label: "🕒 Recently Watched" },
    { id: "trending", label: "🔥 Trending for You" },
    { id: "all", label: "🌍 All Channels" },
  ];

  const channels = [
    { id: 1, name: "HBO HD", quality: "4K", live: true },
    { id: 2, name: "ESPN 1", quality: "HD", live: true },
    { id: 3, name: "Discovery Channel", quality: "HD", live: false },
    { id: 4, name: "Cartoon Network", quality: "SD", live: true },
    { id: 5, name: "BeIN Sports", quality: "4K", live: true },
    { id: 6, name: "CNN International", quality: "HD", live: true },
  ];

  return (
    <section className="mb-12">
      <h2 className="text-lg font-medium tracking-[-0.165px] text-primary mb-4">Your Channels</h2>
      
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
              activeTab === t.id 
                ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-primary" 
                : "bg-transparent border-transparent text-secondary hover:bg-[rgba(255,255,255,0.02)] hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {channels.map((c) => (
          <div key={c.id} className="form-input">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-elevated flex items-center justify-center relative overflow-hidden">
                <Play className="w-5 h-5 text-[rgba(255,255,255,0.2)] group-hover:text-brand transition-colors relative z-10" />
              </div>
              <div>
                <h4 className="font-medium text-[15px] text-primary">{c.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {c.live && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald uppercase">
                      <Radio className="w-3 h-3" /> Live
                    </span>
                  )}
                  <span className="px-1.5 bg-[rgba(255,255,255,0.05)] rounded text-[10px] text-tertiary border border-[rgba(255,255,255,0.05)]">
                    {c.quality}
                  </span>
                </div>
              </div>
            </div>
            <button className="text-tertiary hover:text-accent transition-colors p-2">
              <Star className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}