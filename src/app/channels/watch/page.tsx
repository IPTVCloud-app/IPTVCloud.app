"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StreamPlayer } from "@/components/player/StreamPlayer";
import { Star, Share2, PlusCircle, MessageSquare, Shield, Activity, Send, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SHIMMER_CLASS =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";
const REC_PAGE_SIZE = 20;

interface ChannelInfo {
  id: string;
  name: string;
  logo: string;
  category?: string;
  categories?: string[];
  country?: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  users: {
    username: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
}

function WatchPlayer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [wikiDescription, setWikiDescription] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ChannelInfo[]>([]);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommended" | "related" | "recent">("recommended");
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [recommendationCategory, setRecommendationCategory] = useState("");
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState(true);

  const recommendationOffsetRef = useRef(0);
  const hasMoreRecommendationsRef = useRef(true);
  const loadingRecommendationsRef = useRef(false);
  const recommendationScrollRef = useRef<HTMLDivElement>(null);
  const recommendationSentinelRef = useRef<HTMLDivElement>(null);

  const fetchRecommendationPage = useCallback(
    async (reset = false) => {
      if (!id) return;
      if (loadingRecommendationsRef.current) return;
      if (!reset && !hasMoreRecommendationsRef.current) return;

      const nextOffset = reset ? 0 : recommendationOffsetRef.current;
      loadingRecommendationsRef.current = true;
      setLoadingRecommendations(true);

      try {
        const params = new URLSearchParams({
          limit: String(REC_PAGE_SIZE),
          offset: String(nextOffset),
        });

        if (recommendationCategory) {
          params.set("category", recommendationCategory);
        }

        const res = await fetch(`${apiUrl}/api/channels?${params.toString()}`);
        if (!res.ok) return;
        const recData = (await res.json()) as ChannelInfo[];

        const filtered = recData.filter((channel) => channel.id !== id);
        const hasMore = recData.length >= REC_PAGE_SIZE;

        setRecommendations((prev) => {
          const next = reset ? [] : prev;
          const byId = new Map(next.map((item) => [item.id, item]));
          for (const item of filtered) {
            if (!byId.has(item.id)) byId.set(item.id, item);
          }
          return Array.from(byId.values());
        });

        recommendationOffsetRef.current = nextOffset + REC_PAGE_SIZE;
        hasMoreRecommendationsRef.current = hasMore;
        setHasMoreRecommendations(hasMore);
      } catch (err) {
        console.error("Recommendations error:", err);
      } finally {
        loadingRecommendationsRef.current = false;
        setLoadingRecommendations(false);
      }
    },
    [apiUrl, id, recommendationCategory]
  );

  useEffect(() => {
    if (!id) return;

    Promise.resolve().then(() => {
      setViewerCount(Math.floor(Math.random() * 5000) + 100);
    });

    const fetchMeta = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/channels/${id}`);
        if (!res.ok) return;

        const channel = await res.json();
        if (!channel || channel.error) return;

        setChannelInfo(channel);
        const primaryCategory = channel.categories?.[0] || channel.category || "";
        setRecommendationCategory(primaryCategory);

        const hash = channel.id
          .split("")
          .reduce((acc: number, char: string) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
        setViewerCount(Math.abs(hash % 4900) + 100);

        try {
          const wikiRes = await fetch(`${apiUrl}/api/channels/wiki?id=${id}`);
          if (!wikiRes.ok) return;
          const wikiData = await wikiRes.json();
          setWikiDescription(wikiData.extract || null);
        } catch (wikiErr) {
          console.error("Wiki fetch error:", wikiErr);
        }
      } catch (err) {
        console.error("Error fetching channel data:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchMeta();
  }, [apiUrl, id]);

  useEffect(() => {
    if (!id) return;

    recommendationOffsetRef.current = 0;
    hasMoreRecommendationsRef.current = true;
    loadingRecommendationsRef.current = false;
    Promise.resolve().then(() => {
      setRecommendations([]);
      setHasMoreRecommendations(true);
      setLoadingRecommendations(false);
      void fetchRecommendationPage(true);
    });
  }, [fetchRecommendationPage, id, recommendationCategory]);

  useEffect(() => {
    const root = recommendationScrollRef.current;
    const sentinel = recommendationSentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchRecommendationPage(false);
        }
      },
      {
        root,
        rootMargin: "120px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchRecommendationPage, recommendations.length]);

  const filteredRecommendations = useMemo(() => {
    if (activeTab === "related") {
      const currentCategory = channelInfo?.categories?.[0] || channelInfo?.category;
      if (!currentCategory) return recommendations;
      return recommendations.filter((rec) => (rec.categories?.[0] || rec.category) === currentCategory);
    }

    if (activeTab === "recent") {
      return [...recommendations].reverse();
    }

    return recommendations;
  }, [activeTab, channelInfo?.categories, channelInfo?.category, recommendations]);

  if (!id) return <div className="p-12 text-center text-secondary">No channel ID provided.</div>;

  return (
    <div className={`min-h-screen bg-page text-primary ${isTheaterMode ? "pt-0" : "p-4 md:p-6 lg:p-8"}`}>
      <div className={`mx-auto ${isTheaterMode ? "w-full" : "max-w-[1600px]"}`}>
        {isTheaterMode && (
          <div className="mb-6 flex w-full justify-center bg-black">
            <div className="w-full max-w-screen-2xl">
              <StreamPlayer
                channelId={id}
                isTheaterMode={isTheaterMode}
                onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
              />
            </div>
          </div>
        )}

        <div className={`flex flex-col gap-6 lg:flex-row ${isTheaterMode ? "mx-auto max-w-7xl px-4" : ""}`}>
          <div className={`w-full ${isTheaterMode ? "lg:w-[65%]" : "lg:w-[70%] xl:w-[75%]"}`}>
            {!isTheaterMode && (
              <div className="mb-4 w-full">
                <StreamPlayer
                  channelId={id}
                  isTheaterMode={isTheaterMode}
                  onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
                />
              </div>
            )}

            <div className="w-full">
              {loading ? (
                <div className="space-y-4">
                  <div className={`h-8 w-1/2 rounded bg-elevated ${SHIMMER_CLASS}`} />
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full bg-elevated ${SHIMMER_CLASS}`} />
                    <div className="flex-1 space-y-2">
                      <div className={`h-4 w-40 rounded bg-elevated ${SHIMMER_CLASS}`} />
                      <div className={`h-3 w-24 rounded bg-elevated ${SHIMMER_CLASS}`} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="mb-2 line-clamp-2 text-xl font-bold text-primary md:text-2xl">
                    {channelInfo?.name || "Unknown Channel"}
                  </h1>

                  <div className="mb-4 flex flex-col justify-between gap-4 border-b border-border/50 py-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      {channelInfo?.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={channelInfo.logo}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full border border-border bg-white/5 object-contain"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-xl font-bold uppercase text-brand">
                          {channelInfo?.name?.substring(0, 1) || "C"}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="text-base font-bold text-primary">{channelInfo?.name}</span>
                        <span className="text-xs text-secondary">
                          {channelInfo?.country || "International"} • {viewerCount} watching
                        </span>
                      </div>

                      <button className="ml-4 shrink-0 btn-primary">
                        Follow
                      </button>
                    </div>

                    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      <button
                        onClick={() => {
                          setIsFavorite(!isFavorite);
                          toast.success(isFavorite ? "Removed from Favorites" : "Added to Favorites");
                        }}
                        className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 transition-colors ${
                          isFavorite ? "border-brand bg-brand/10 text-brand" : "border-border bg-surface hover:bg-hover"
                        }`}
                      >
                        <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                        <span className="text-sm font-medium">Favorite</span>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            if (navigator.share) {
                              await navigator.share({
                                title: channelInfo?.name || "IPTVCloud",
                                url: window.location.href,
                              });
                            } else {
                              await navigator.clipboard.writeText(window.location.href);
                              toast.success("Link copied!");
                            }
                          } catch (shareErr) {
                            console.error("Share failed:", shareErr);
                          }
                        }}
                        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 transition-colors hover:bg-hover"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Share</span>
                      </button>

                      <button
                        onClick={() => toast.success("Select a playlist to add to.")}
                        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 transition-colors hover:bg-hover"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Add to Playlist</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 card cursor-pointer transition-colors">
                    <div className="mb-2 flex items-center gap-2 font-bold">
                      {(channelInfo?.categories?.[0] || channelInfo?.category || "General") as string} Category
                    </div>
                    <p className="leading-relaxed text-secondary">
                      {wikiDescription || `No available description for ${channelInfo?.name}.`}
                    </p>
                  </div>
                </>
              )}

              {isTheaterMode && (
                <div className="mt-6 hidden lg:block">
                  <LiveChatComponent channelId={id} />
                </div>
              )}
            </div>
          </div>

          <div className={`flex w-full flex-col gap-6 ${isTheaterMode ? "lg:w-[35%]" : "lg:w-[30%] xl:w-[25%]"}`}>
            <div className={`${isTheaterMode ? "lg:hidden" : "block"}`}>
              <LiveChatComponent channelId={id} />
            </div>

            <div className="flex flex-col">
              <div className="no-scrollbar mb-4 flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveTab("recommended")}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === "recommended"
                      ? "btn-primary border-none"
                      : "btn-ghost"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("related")}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === "related"
                      ? "btn-primary border-none"
                      : "btn-ghost"
                  }`}
                >
                  Related
                </button>
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === "recent"
                      ? "btn-primary border-none"
                      : "btn-ghost"
                  }`}
                >
                  Recently Watched
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex h-[90px] gap-3">
                      <div className={`w-40 shrink-0 rounded-lg bg-elevated ${SHIMMER_CLASS}`} />
                      <div className="flex flex-1 flex-col gap-2 py-1">
                        <div className={`h-4 w-full rounded bg-elevated ${SHIMMER_CLASS}`} />
                        <div className={`h-3 w-1/2 rounded bg-elevated ${SHIMMER_CLASS}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div ref={recommendationScrollRef} className="custom-scrollbar flex max-h-[800px] flex-col gap-3 overflow-y-auto pr-2">
                  {filteredRecommendations.map((rec) => (
                    <Link key={rec.id} href={`/channels/watch?id=${rec.id}`} className="group flex gap-3">
                      <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-elevated transition-colors group-hover:border-brand/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${apiUrl}/api/channels/thumbnail?id=${rec.id}`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-bold text-white">
                          <Activity className="h-2.5 w-2.5 text-emerald" /> LIVE
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col py-0.5">
                        <span className="line-clamp-2 text-sm font-bold leading-tight text-primary transition-colors group-hover:text-brand">
                          {rec.name}
                        </span>
                        <span className="mt-1 text-xs text-secondary">{rec.categories?.[0] || rec.category || "General"}</span>
                        <span className="text-xs text-tertiary">{rec.country || "International"}</span>
                      </div>
                    </Link>
                  ))}

                  {!loadingRecommendations && filteredRecommendations.length === 0 && (
                    <div className="card p-4 text-center text-sm text-secondary">
                      No channels found for this tab.
                    </div>
                  )}

                  <div ref={recommendationSentinelRef} className="h-2 w-full" />

                  {loadingRecommendations && (
                    <div className="py-2 text-center text-xs text-secondary">Loading more channels...</div>
                  )}

                  {!hasMoreRecommendations && filteredRecommendations.length > 0 && (
                    <div className="py-2 text-center text-xs text-tertiary">You reached the end.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function LiveChatComponent({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.resolve().then(() => setIsAuthenticated(!!token));

    const fetchComments = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        const res = await fetch(`${apiUrl}/api/comments/${channelId}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.comments.reverse());
      } catch (err) {
        console.error("Chat error:", err);
      }
    };
    void fetchComments();

    const channel = supabase
      .channel(`chat:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `channel_short_id=eq.${channelId}`,
        },
        async (payload) => {
          const { data: user } = await supabase
            .from("users")
            .select("username, avatar_url, is_verified")
            .eq("id", payload.new.user_id)
            .single();

          if (!user) return;
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            user_id: payload.new.user_id,
            users: {
              username: user.username,
              avatar_url: user.avatar_url || undefined,
              is_verified: user.is_verified || false,
            },
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isSending) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Sign in to chat");
      return;
    }

    setIsSending(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/comments/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: input.trim(),
          channel_short_id: channelId,
        }),
      });

      if (res.ok) {
        setInput("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send");
      }
    } catch (err) {
      toast.error("Connection error");
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card flex h-[500px] flex-col">
      <div className="flex items-center justify-between rounded-t-xl border-b border-border bg-page/50 p-3">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <MessageSquare className="h-4 w-4" /> Live Chat
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" /> {messages.length + 120}
        </div>
      </div>

      <div ref={scrollRef} className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && <div className="py-10 text-center text-xs text-tertiary">Welcome to the chat!</div>}
        {messages.map((msg, i) => (
          <div key={msg.id || i} className="group animate-in slide-in-from-bottom-2 fade-in text-sm duration-300">
            <div className="flex items-start gap-2">
              {msg.users?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={msg.users.avatar_url} alt="" className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover" />
              ) : (
                <UserCircle className="mt-0.5 h-6 w-6 shrink-0 text-tertiary" />
              )}
              <div>
                <span className="mr-2 text-[13px] font-bold text-secondary">{msg.users?.username || "User"}</span>
                <span className="break-words leading-relaxed text-primary">{msg.content}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="border-t border-border bg-page/30 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/20">
            <Shield className="h-4 w-4 text-brand" />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={isAuthenticated ? "Send a message..." : "Sign in to chat..."}
              disabled={!isAuthenticated || isSending}
              className="form-input rounded-full pl-4 pr-10 py-1.5"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending || !isAuthenticated}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-brand transition-colors hover:text-accent disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-tertiary">Loading player...</div>}>
      <WatchPlayer />
    </Suspense>
  );
}

