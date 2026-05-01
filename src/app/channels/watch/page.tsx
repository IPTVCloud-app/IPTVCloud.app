"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { StreamPlayer } from "@/components/player/StreamPlayer";
import { Star, Share2, PlusCircle, MessageSquare, Shield, Activity, Send, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SHIMMER_CLASS = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

interface ChannelInfo {
  id: string;
  name: string;
  logo: string;
  category?: string;
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
  
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [wikiDescription, setWikiDescription] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ChannelInfo[]>([]);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommended" | "related" | "recent">("recommended");
  const [viewerCount, setViewerCount] = useState<number>(0);

  // Load Channel Metadata and Recommendations
  useEffect(() => {
    if (!id) return;
    
    // Set random viewer count once on mount/id change
    Promise.resolve().then(() => {
      setViewerCount(Math.floor(Math.random() * 5000) + 100);
    });

    const fetchMeta = async () => {
      setLoading(true);
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        // Fetch current channel exactly by ID
        const res = await fetch(`${apiUrl}/api/channels/${id}`);
        if (res.ok) {
          const channel = await res.json();
          if (channel && !channel.error) {
             setChannelInfo(channel);
             
             const hash = channel.id.split('').reduce((a: number, b: string) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);
             setViewerCount(Math.abs(hash % 4900) + 100);
             
             // Fetch Wikipedia summary from backend using exact ID
             try {
                const wikiRes = await fetch(`${apiUrl}/api/channels/wiki?id=${id}`);
                if (wikiRes.ok) {
                    const wikiData = await wikiRes.json();
                    if (wikiData.extract) {
                        setWikiDescription(wikiData.extract);
                    }
                }
             } catch (e) {
                console.error("Wiki fetch error:", e);
             }

             // Fetch recommendations
             const recRes = await fetch(`${apiUrl}/api/channels?limit=25&category=${channel.categories?.[0] || channel.category || ''}`);
             if (recRes.ok) {
               const recData = await recRes.json();
               setRecommendations(recData.filter((c: ChannelInfo) => c.id !== id));
             }
          }
        }
      } catch (err) {
        console.error("Error fetching channel data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, [id]);

  if (!id) return <div className="p-12 text-center text-secondary">No channel ID provided.</div>;

  return (
    <div className={`min-h-screen bg-page text-primary ${isTheaterMode ? 'pt-0' : 'p-4 md:p-6 lg:p-8'}`}>
      <div className={`mx-auto ${isTheaterMode ? 'w-full' : 'max-w-[1600px]'}`}>
        
        {isTheaterMode && (
          <div className="w-full bg-black flex justify-center mb-6">
             <div className="w-full max-w-screen-2xl">
               <StreamPlayer 
                  channelId={id} 
                  isTheaterMode={isTheaterMode}
                  onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
               />
             </div>
          </div>
        )}

        <div className={`flex flex-col lg:flex-row gap-6 ${isTheaterMode ? 'max-w-7xl mx-auto px-4' : ''}`}>
          
          <div className={`w-full ${isTheaterMode ? 'lg:w-[65%]' : 'lg:w-[70%] xl:w-[75%]'}`}>
            
            {!isTheaterMode && (
               <div className="w-full mb-4">
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
                  <div className={`h-8 w-1/2 bg-elevated rounded ${SHIMMER_CLASS}`} />
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-full bg-elevated ${SHIMMER_CLASS}`} />
                     <div className="space-y-2 flex-1">
                        <div className={`h-4 w-40 bg-elevated rounded ${SHIMMER_CLASS}`} />
                        <div className={`h-3 w-24 bg-elevated rounded ${SHIMMER_CLASS}`} />
                     </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl md:text-2xl font-bold text-primary mb-2 line-clamp-2">
                    {channelInfo?.name || "Unknown Channel"}
                  </h1>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 mb-4 border-b border-border/50">
                    <div className="flex items-center gap-4">
                      {channelInfo?.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={channelInfo.logo} alt="" className="w-12 h-12 object-contain shrink-0 rounded-full bg-white/5 border border-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-xl uppercase shrink-0">
                          {channelInfo?.name?.substring(0, 1) || "C"}
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <span className="font-bold text-primary text-base">{channelInfo?.name}</span>
                        <span className="text-xs text-secondary">{channelInfo?.country || "International"} • {viewerCount} watching</span>
                      </div>

                      <button className="ml-4 px-5 py-2 bg-primary text-page rounded-full text-sm font-bold hover:bg-white/90 transition-colors shrink-0">
                        Follow
                      </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                      <button 
                        onClick={() => {
                          setIsFavorite(!isFavorite);
                          toast.success(isFavorite ? "Removed from Favorites" : "Added to Favorites");
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors whitespace-nowrap border ${isFavorite ? 'bg-brand/10 border-brand text-brand' : 'bg-surface border-border hover:bg-white/5'}`}
                      >
                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /> <span className="text-sm font-medium">Favorite</span>
                      </button>

                      <button 
                        onClick={async () => {
                          try {
                            if (navigator.share) {
                              await navigator.share({
                                title: channelInfo?.name || 'IPTVCloud',
                                url: window.location.href
                              });
                            } else {
                              await navigator.clipboard.writeText(window.location.href);
                              toast.success("Link copied!");
                            }
                          } catch (err) {
                            console.error("Share failed", err);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full hover:bg-white/5 transition-colors whitespace-nowrap"
                      >
                        <Share2 className="w-4 h-4" /> <span className="text-sm font-medium">Share</span>
                      </button>

                      <button 
                        onClick={() => toast.success("Select a playlist to add to.")}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full hover:bg-white/5 transition-colors whitespace-nowrap"
                      >
                        <PlusCircle className="w-4 h-4" /> <span className="text-sm font-medium">Add to Playlist</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface border border-border rounded-xl p-4 text-sm mt-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="font-bold mb-2 flex items-center gap-2">
                       {channelInfo?.category || "General"} Category
                    </div>
                    <p className="text-secondary leading-relaxed">
                      {wikiDescription || `No available description for ${channelInfo?.name}.`}
                    </p>
                  </div>
                </>
              )}

              {isTheaterMode && (
                <div className="hidden lg:block mt-6">
                   <LiveChatComponent channelId={id} />
                </div>
              )}
            </div>
          </div>

          <div className={`w-full ${isTheaterMode ? 'lg:w-[35%]' : 'lg:w-[30%] xl:w-[25%]'} flex flex-col gap-6`}>
            
            <div className={`${isTheaterMode ? 'lg:hidden' : 'block'}`}>
               <LiveChatComponent channelId={id} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                 <button onClick={() => setActiveTab("recommended")} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "recommended" ? 'bg-primary text-page' : 'bg-surface border border-border text-secondary hover:bg-white/5'}`}>All</button>
                 <button onClick={() => setActiveTab("related")} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "related" ? 'bg-primary text-page' : 'bg-surface border border-border text-secondary hover:bg-white/5'}`}>Related</button>
                 <button onClick={() => setActiveTab("recent")} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "recent" ? 'bg-primary text-page' : 'bg-surface border border-border text-secondary hover:bg-white/5'}`}>Recently Watched</button>
              </div>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex gap-3 h-[90px]">
                      <div className={`w-40 shrink-0 bg-elevated rounded-lg ${SHIMMER_CLASS}`} />
                      <div className="flex flex-col gap-2 flex-1 py-1">
                         <div className={`h-4 w-full bg-elevated rounded ${SHIMMER_CLASS}`} />
                         <div className={`h-3 w-1/2 bg-elevated rounded ${SHIMMER_CLASS}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {recommendations
                    .filter(rec => {
                      if (activeTab === 'related') return rec.category === channelInfo?.category;
                      if (activeTab === 'recent') return Math.random() > 0.5; // Pseudo-random for demonstration of recent filter
                      return true; // "recommended" / All
                    })
                    .slice(0, 20).map((rec: ChannelInfo, idx) => (
                    <Link key={idx} href={`/channels/watch?id=${rec.id}`} className="flex gap-3 group">
                      <div className="w-40 shrink-0 relative aspect-video bg-elevated rounded-lg overflow-hidden border border-border group-hover:border-brand/50 transition-colors">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img src={`${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')}/api/channels/thumbnail?id=${rec.id}`} alt="" className="w-full h-full object-cover" />
                         <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                           <Activity className="w-2.5 h-2.5 text-red-500" /> LIVE
                         </div>
                      </div>
                      <div className="flex flex-col py-0.5 flex-1 min-w-0">
                         <span className="font-bold text-sm leading-tight text-primary group-hover:text-brand transition-colors line-clamp-2">
                           {rec.name}
                         </span>
                         <span className="text-xs text-secondary mt-1">{rec.category || 'General'}</span>
                         <span className="text-xs text-tertiary">{rec.country || 'International'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
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
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
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

  // Fetch initial comments
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const fetchComments = async () => {
        try {
          const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
          const res = await fetch(`${apiUrl}/api/comments/${channelId}`);
          if (res.ok) {
            const data = await res.json();
            setMessages(data.comments.reverse());
          }
        } catch (err) {
          console.error("Chat error:", err);
        }
    };
    fetchComments();

    // Setup Realtime subscription
    const channel = supabase
      .channel(`chat:${channelId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments',
        filter: `channel_short_id=eq.${channelId}`
      }, async (payload) => {
        // Fetch user data for the new comment
        const { data: user } = await supabase
          .from('users')
          .select('username, avatar_url, is_verified')
          .eq('id', payload.new.user_id)
          .single();
        
        if (user) {
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            user_id: payload.new.user_id,
            users: {
              username: user.username,
              avatar_url: user.avatar_url || undefined,
              is_verified: user.is_verified || false
            }
          };
          setMessages(prev => [...prev, newMessage]);
        }
      })
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const token = localStorage.getItem('token');
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
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                content: input.trim(),
                channel_short_id: channelId
            })
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
    <div className="bg-surface border border-border rounded-xl flex flex-col h-[500px]">
      <div className="p-3 border-b border-border flex items-center justify-between bg-page/50 rounded-t-xl">
        <div className="flex items-center gap-2 font-bold text-sm text-primary">
          <MessageSquare className="w-4 h-4" /> Live Chat
        </div>
        <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> {messages.length + 120}
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
         {messages.length === 0 && (
            <div className="text-center text-tertiary text-xs py-10">Welcome to the chat!</div>
         )}
         {messages.map((msg, i) => (
            <div key={msg.id || i} className="text-sm group animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="flex items-start gap-2">
                  {msg.users?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={msg.users.avatar_url} alt="" className="w-6 h-6 rounded-full shrink-0 mt-0.5 object-cover" />
                  ) : (
                    <UserCircle className="w-6 h-6 text-tertiary shrink-0 mt-0.5" />
                  )}
                  <div>
                     <span className="font-bold text-secondary mr-2 text-[13px]">{msg.users?.username || 'User'}</span>
                     <span className="text-primary break-words leading-relaxed">{msg.content}</span>
                  </div>
               </div>
            </div>
         ))}
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-border bg-page/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
             <Shield className="w-4 h-4 text-brand" />
          </div>
          <div className="flex-1 relative">
             <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isAuthenticated ? "Send a message..." : "Sign in to chat..."} 
                disabled={!isAuthenticated || isSending}
                className="w-full bg-surface border border-border rounded-full pl-4 pr-10 py-1.5 text-sm focus:outline-none focus:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
             />
             <button 
                type="submit"
                disabled={!input.trim() || isSending || !isAuthenticated}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand hover:text-accent disabled:opacity-30 transition-colors"
             >
                <Send className="w-4 h-4" />
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
