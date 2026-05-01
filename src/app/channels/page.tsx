"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Globe, Radio, X, Languages, MapPin } from "lucide-react";
import { ChannelThumbnail } from "@/components/ChannelThumbnail";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

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

interface MetadataItem {
  code: string;
  name: string;
}

const SHIMMER_CLASS = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

export default function ChannelsExplorerPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  
  const [categories, setCategories] = useState<MetadataItem[]>([]);
  const [languages, setLanguages] = useState<MetadataItem[]>([]);
  const [countries, setCountries] = useState<MetadataItem[]>([]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [_page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const { ref, inView } = useInView({ threshold: 0 });
  const filterRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Metadata (Categories, Languages, Countries)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        const [catRes, langRes, countRes] = await Promise.all([
          fetch(`${apiUrl}/api/channels/categories`),
          fetch(`${apiUrl}/api/channels/languages`),
          fetch(`${apiUrl}/api/channels/countries`)
        ]);

        if (catRes.ok) {
          const data = await catRes.json();
          setCategories([{ code: "All", name: "All" }, ...data.map((c: { id: string; name: string }) => ({ code: c.id, name: c.name })).sort((a: MetadataItem, b: MetadataItem) => a.name.localeCompare(b.name))]);
        }
        if (langRes.ok) {
          const data = await langRes.json();
          setLanguages(data.sort((a: MetadataItem, b: MetadataItem) => a.name.localeCompare(b.name)));
        }
        if (countRes.ok) {
          const data = await countRes.json();
          setCountries(data.sort((a: MetadataItem, b: MetadataItem) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Fetch Channels with pagination
  const fetchChannels = useCallback(async (pageNum: number, isInitial = false) => {
    if (pageNum > 0) setLoadingMore(true);
    else setLoading(true);

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const limit = 40;
      const offset = pageNum * limit;
      let url = `${apiUrl}/api/channels?limit=${limit}&offset=${offset}`;
      
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery.toLowerCase())}`;
      if (selectedCategory !== "All") url += `&category=${encodeURIComponent(selectedCategory.toLowerCase())}`;
      if (selectedLanguage !== "All") url += `&language=${encodeURIComponent(selectedLanguage.toLowerCase())}`;
      if (selectedCountry !== "All") url += `&country=${encodeURIComponent(selectedCountry.toLowerCase())}`;

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
  }, [searchQuery, selectedCategory, selectedLanguage, selectedCountry]);

  // 3. Handle search/filter reset
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchChannels(0, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchChannels]);

  // 4. Handle Infinite Scroll trigger
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      Promise.resolve().then(() => {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchChannels(nextPage);
          return nextPage;
        });
      });
    }
  }, [inView, hasMore, loading, loadingMore, fetchChannels]);

  // 5. Close filters on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  const activeFilterCount = [
    selectedLanguage !== "All",
    selectedCountry !== "All"
  ].filter(Boolean).length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-page text-primary p-4 md:p-8 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-primary mb-2 text-display">Channel Explorer</h1>
            <p className="text-secondary text-body">Discover thousands of live channels globally.</p>
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
            
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  showFilters || activeFilterCount > 0
                    ? "bg-brand border-brand text-white shadow-lg shadow-brand/20" 
                    : "bg-surface border-border text-secondary hover:border-accent"
                }`}
              >
                <Filter className="w-4 h-4" /> 
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white text-brand rounded-full text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="card absolute right-0 mt-2 w-80 z-[60] p-5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                      <h3 className="font-bold text-primary flex items-center gap-2">
                        <Filter className="w-4 h-4 text-brand" /> Advanced Filters
                      </h3>
                      <button onClick={() => setShowFilters(false)} className="text-tertiary hover:text-primary transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Language Filter */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-tertiary flex items-center gap-2">
                          <Languages className="w-3.5 h-3.5" /> Language
                        </label>
                        <select 
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand transition-colors appearance-none cursor-pointer"
                        >
                          <option value="All">All Languages</option>
                          {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Country Filter */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-tertiary flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" /> Country
                        </label>
                        <select 
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand transition-colors appearance-none cursor-pointer"
                        >
                          <option value="All">All Countries</option>
                          {countries.map(country => (
                            <option key={country.code} value={country.code}>{country.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            setSelectedLanguage("All");
                            setSelectedCountry("All");
                            setSelectedCategory("All");
                            setSearchQuery("");
                          }}
                          className="flex-1 px-4 py-2 bg-page border border-border rounded-lg text-xs font-bold text-secondary hover:bg-hover transition-colors"
                        >
                          Reset All
                        </button>
                        <button 
                          onClick={() => setShowFilters(false)}
                          className="btn-brand"
                        >
                          Show Results
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
                selectedCategory === cat.code 
                  ? "bg-brand border-brand text-white shadow-lg shadow-brand/20" 
                  : "bg-surface border-border text-secondary hover:border-accent"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((channel, idx) => (
            <Link key={`${channel.id}-${idx}`} href={`/channels/watch?id=${channel.id}`} className="group block">
              <div className="card">
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
                  <div className="flex items-start gap-3 mb-3">
                    {channel.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt="" className="w-8 h-8 object-contain shrink-0 rounded bg-white/5 p-1 border border-border/50" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold shrink-0 text-xs uppercase">
                        {channel.name.substring(0, 1)}
                      </div>
                    )}
                    <h3 className="font-medium text-[15px] leading-snug line-clamp-2 group-hover:text-brand transition-colors flex-1">{channel.name}</h3>
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
            <div key={`skeleton-${i}`} className="card">
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
                You&apos;ve reached the end of the global index.
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
