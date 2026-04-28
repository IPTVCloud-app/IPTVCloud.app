"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Globe, Monitor, Radio } from "lucide-react";
import { ChannelThumbnail } from "@/components/ChannelThumbnail";

interface Channel {
  id: string;
  name: string;
  logo: string;
  thumbnail: string;
  category: string;
  country: string;
  quality: string;
  language: string;
}

export default function ChannelsExplorerPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  // 1. Fetch Categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
        const res = await fetch(`${apiUrl}/api/channels/categories`);
        if (res.ok) {
          const data = await res.json();
          // data is array of { id, name }
          const catNames = ["All", ...data.map((c: any) => c.name).sort()];
          setCategories(catNames);
        }
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  // 2. Server-side Search with Debounce
  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
        let url = `${apiUrl}/api/channels?limit=100`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        if (selectedCategory !== "All") url += `&category=${encodeURIComponent(selectedCategory)}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setChannels(data);
        }
      } catch (error) {
        console.error("Failed to fetch channels", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchChannels();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-page text-primary p-4 md:p-8 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-primary mb-2">Channel Explorer</h1>
            <p className="text-secondary">Discover thousands of live channels globally.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
              <input 
                type="text" 
                placeholder="Search channels..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border focus:border-brand pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border hover:border-brand rounded-lg text-sm font-medium transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                selectedCategory === cat 
                  ? "bg-brand/10 border-brand text-brand" 
                  : "bg-surface border-border text-secondary hover:border-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {channels.map((channel) => (
              <Link key={channel.id} href={`/channels/watch?id=${channel.id}`} className="group block">
                <div className="bg-surface border border-border rounded-xl overflow-hidden hover:border-brand transition-colors h-full flex flex-col">
                  {/* Aspect ratio 16:9 for thumbnail */}
                  <div className="relative w-full pt-[56.25%] bg-elevated">
                    <div className="absolute inset-0">
                      <ChannelThumbnail 
                        channelId={channel.id} 
                        name={channel.name} 
                        logoUrl={channel.logo}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white flex items-center gap-1 border border-white/10">
                      <Radio className="w-3 h-3 text-red-500" /> LIVE
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-medium text-[15px] leading-snug line-clamp-2">{channel.name}</h3>
                      {channel.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={channel.logo} alt="" className="w-8 h-8 object-contain shrink-0 rounded bg-white/5" />
                      )}
                    </div>
                    
                    <div className="mt-auto flex items-center flex-wrap gap-2 text-xs text-tertiary">
                      {channel.category && (
                        <span className="px-2 py-1 bg-[rgba(255,255,255,0.03)] border border-border rounded-md">
                          {channel.category}
                        </span>
                      )}
                      {channel.country && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-[rgba(255,255,255,0.03)] border border-border rounded-md">
                          <Globe className="w-3 h-3" /> {channel.country}
                        </span>
                      )}
                      {channel.quality && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-brand/10 border border-brand/20 text-brand rounded-md font-mono uppercase">
                          <Monitor className="w-3 h-3" /> {channel.quality}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && channels.length === 0 && (
          <div className="text-center py-20 text-tertiary">
            No channels found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
