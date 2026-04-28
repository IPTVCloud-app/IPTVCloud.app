"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Filter, Globe, Monitor, Radio, LayoutGrid, List } from "lucide-react";
import { ChannelThumbnail } from "@/components/ChannelThumbnail";
import { useInView } from "react-intersection-observer";

interface Channel {
  id: string;
  name: string;
  logo: string;
  thumbnail: string;
  category: string;
  country: string;
  quality: string;
  language: string;
  status?: string;
}

const SHIMMER_CLASS = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

export default function ChannelsExplorerPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const { ref, inView } = useInView({ threshold: 0 });

  // 1. Fetch Categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
        const res = await fetch(`${apiUrl}/api/channels/categories`);
        if (res.ok) {
          const data = await res.json();
          const catNames = ["All", ...data.map((c: any) => c.name).sort()];
          setCategories(catNames);
        }
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  // 2. Fetch Channels with pagination
  const fetchChannels = async (pageNum: number, isInitial = false) => {
    if (pageNum > 0) setLoadingMore(true);
    else setLoading(true);

    try {
      const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
      const limit = 40;
      const offset = pageNum * limit;
      let url = `${apiUrl}/api/channels?limit=${limit}&offset=${offset}`;
      
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (selectedCategory !== "All") url += `&category=${encodeURIComponent(selectedCategory)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (isInitial) {
          setChannels(data);
        } else {
          setChannels(prev => [...prev, ...data]);
        }
        setHasMore(data.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch channels", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 3. Handle search/filter reset
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchChannels(0, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // 4. Handle Infinite Scroll trigger
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchChannels(nextPage);
    }
  }, [inView]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-page text-primary p-4 md:p-8 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
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

        {/* Categories Bar */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
                selectedCategory === cat 
                  ? "bg-brand border-brand text-white shadow-lg shadow-brand/20" 
                  : "bg-surface border-border text-secondary hover:border-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((channel, idx) => (
            <Link key={`${channel.id}-${idx}`} href={`/channels/watch?id=${channel.id}`} className="group block">
              <div className="bg-surface border border-border rounded-xl overflow-hidden hover:border-brand transition-all duration-300 h-full flex flex-col hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1">
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
                    <Radio className="w-3 h-3 text-red-500 animate-pulse" /> LIVE
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-medium text-[15px] leading-snug line-clamp-2 group-hover:text-brand transition-colors">{channel.name}</h3>
                    {channel.logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt="" className="w-8 h-8 object-contain shrink-0 rounded bg-white/5 p-1 border border-border/50" />
                    )}
                  </div>
                  
                  <div className="mt-auto flex items-center flex-wrap gap-2 text-[11px] text-tertiary">
                    {channel.category && (
                      <span className="px-2 py-1 bg-page border border-border rounded-md">
                        {channel.category}
                      </span>
                    )}
                    {channel.country && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-page border border-border rounded-md">
                        <Globe className="w-3 h-3 text-brand/70" /> {channel.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Initial Loading Skeletons */}
          {loading && Array.from({ length: 12 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-surface border border-border rounded-xl overflow-hidden h-[280px]">
              <div className={`w-full pt-[56.25%] bg-elevated ${SHIMMER_CLASS}`} />
              <div className="p-4 space-y-3">
                <div className={`h-5 w-3/4 bg-elevated rounded ${SHIMMER_CLASS}`} />
                <div className="flex gap-2">
                  <div className={`h-6 w-20 bg-elevated rounded-md ${SHIMMER_CLASS}`} />
                  <div className={`h-6 w-20 bg-elevated rounded-md ${SHIMMER_CLASS}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Trigger */}
        <div ref={ref} className="py-12 flex justify-center">
           {loadingMore && (
             <div className="flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
               <span className="text-tertiary text-xs font-medium tracking-widest uppercase">Loading more channels...</span>
             </div>
           )}
           {!hasMore && channels.length > 0 && (
             <div className="text-tertiary text-sm font-medium border-t border-border w-full pt-10 text-center">
                You've reached the end of the global index.
             </div>
           )}
        </div>

        {!loading && channels.length === 0 && (
          <div className="text-center py-40">
             <div className="w-16 h-16 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-brand/20" />
             </div>
             <h3 className="text-xl font-medium text-primary mb-1">No channels found</h3>
             <p className="text-secondary">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
