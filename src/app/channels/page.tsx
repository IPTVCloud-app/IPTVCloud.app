"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Baby,
  Clapperboard,
  Dumbbell,
  Film,
  Filter,
  Gamepad2,
  Landmark,
  Languages,
  MapPin,
  MonitorPlay,
  Music2,
  Newspaper,
  Radio,
  Search,
  Tags,
  Trophy,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
  description?: string;
  categories?: string[];
}

interface MetadataItem {
  code: string;
  name: string;
}

const SHIMMER_CLASS = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const CATEGORY_ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/news|weather|local/i, Newspaper],
  [/sport|football|soccer|basketball|fight|racing/i, Trophy],
  [/movie|cinema|film/i, Film],
  [/music|radio/i, Music2],
  [/kids|children|family/i, Baby],
  [/fitness|health|workout/i, Dumbbell],
  [/game|gaming|esport/i, Gamepad2],
  [/documentary|history|culture/i, Landmark],
  [/series|entertainment|show/i, Clapperboard],
  [/live|tv|general/i, MonitorPlay],
];

function formatTagLabel(value?: string) {
  if (!value) return "";
  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCategoryIcon(category?: string) {
  const Icon = CATEGORY_ICON_RULES.find(([pattern]) => pattern.test(category || ""))?.[1] || Tags;
  return <Icon className="h-3.5 w-3.5" />;
}

function getChannelSummary(channel: Channel) {
  if (channel.description?.trim()) return channel.description.trim();

  const category = formatTagLabel(channel.categories?.[0] || channel.category) || "live";
  const country = formatTagLabel(channel.country) || "global";
  const language = formatTagLabel(channel.language);
  const languagePart = language ? ` with ${language} programming` : "";

  return `${channel.name} is a ${category.toLowerCase()} channel from ${country}${languagePart}.`;
}

export default function ChannelsExplorerPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  
  const [categories, setCategories] = useState<MetadataItem[]>([{ code: "All", name: "All" }]);
  const [languages, setLanguages] = useState<MetadataItem[]>([]);
  const [countries, setCountries] = useState<MetadataItem[]>([]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [, setPage] = useState(0);
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
    <div className="app-page min-h-[calc(100vh-64px)] px-4 py-8 text-primary md:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <span className="text-mono-label text-quaternary">Live Library</span>
            <h1 className="mt-2 text-heading-1 text-primary">Channel Explorer</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary">
              Discover live channels by category, language, and country.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
              <input 
                type="text" 
                placeholder="Search channels..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-10 pr-4"
              />
            </div>
            
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto ${
                  showFilters || activeFilterCount > 0
                    ? "btn-primary border-none" 
                    : "btn-ghost"
                }`}
              >
                <Filter className="w-4 h-4" /> 
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 badge-brand text-[10px]">
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
                    className="card absolute right-0 z-[60] mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden p-5"
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
                          className="form-input appearance-none cursor-pointer"
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
                          className="form-input appearance-none cursor-pointer"
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
                          className="flex-1 btn-ghost"
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
        <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setSelectedCategory(cat.code)}
              className={`inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-[510] transition-colors ${
                selectedCategory === cat.code 
                  ? "border-brand bg-brand text-white" 
                  : "border-border bg-surface/50 text-secondary hover:border-[var(--border-secondary)] hover:bg-surface hover:text-primary"
              }`}
            >
              {cat.code === "All" ? <Tags className="h-3.5 w-3.5" /> : getCategoryIcon(cat.name)}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {channels.map((channel, idx) => (
            <Link key={`${channel.id}-${idx}`} href={`/channels/watch?id=${channel.id}`} className="group block h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface/50 backdrop-blur-md transition-colors hover:border-brand/50 hover:bg-surface/80">
                <div className="relative aspect-video bg-elevated">
                  <ChannelThumbnail
                    channelId={channel.id}
                    name={channel.name}
                    logoUrl={channel.logo}
                    className="h-full w-full border-0"
                  />
                  <div className="absolute left-2 top-2 badge-success text-[10px]">
                    <Radio className="h-3 w-3" /> LIVE
                  </div>
                  {channel.quality && (
                    <div className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/55 px-2 py-1 text-[10px] font-[510] text-white backdrop-blur-sm">
                      {formatTagLabel(channel.quality)}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3 flex items-start gap-3">
                    {channel.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt="" className="h-9 w-9 shrink-0 rounded-md border border-border bg-white/5 object-contain p-1" />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-brand/20 bg-brand/10 text-xs font-[590] uppercase text-brand">
                        {channel.name.substring(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-[15px] font-[590] leading-snug text-primary transition-colors group-hover:text-accent">
                        {channel.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-tertiary">
                        {formatTagLabel(channel.country) || "Global"}
                      </p>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-secondary">
                    {getChannelSummary(channel)}
                  </p>
                  
                  <div className="mt-auto flex flex-wrap gap-2">
                    {channel.category && (
                      <span className="badge-subtle">
                        {getCategoryIcon(channel.category)}
                        {formatTagLabel(channel.category)}
                      </span>
                    )}
                    {channel.language && (
                      <span className="badge-subtle">
                        <Languages className="h-3.5 w-3.5" />
                        {formatTagLabel(channel.language)}
                      </span>
                    )}
                    {channel.country && (
                      <span className="badge-subtle">
                        <MapPin className="h-3.5 w-3.5" />
                        {formatTagLabel(channel.country)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}

          {/* Initial Loading Skeletons */}
          {loading && Array.from({ length: 12 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="overflow-hidden rounded-lg border border-border bg-surface/50">
              <div className={`aspect-video bg-elevated ${SHIMMER_CLASS}`} />
              <div className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-md bg-elevated ${SHIMMER_CLASS}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 w-3/4 rounded bg-elevated ${SHIMMER_CLASS}`} />
                    <div className={`h-3 w-1/3 rounded bg-elevated ${SHIMMER_CLASS}`} />
                  </div>
                </div>
                <div className={`h-8 w-full rounded bg-elevated ${SHIMMER_CLASS}`} />
                <div className="flex gap-2">
                  <div className={`h-6 w-20 rounded-full bg-elevated ${SHIMMER_CLASS}`} />
                  <div className={`h-6 w-20 rounded-full bg-elevated ${SHIMMER_CLASS}`} />
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
    </div>
  );
}

