"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, notFound } from "next/navigation";
import { StreamPlayer } from "@/components/player/StreamPlayer";
import { Star, Share2, PlusCircle, MessageSquare, Shield, History, ThumbsUp, Activity } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const SHIMMER_CLASS = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

function WatchPlayer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [channelInfo, setChannelInfo] = useState<any>(null);
  const [wikiDescription, setWikiDescription] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommended" | "related" | "recent">("recommended");

  // Load Channel Metadata and Recommendations
  useEffect(() => {
    if (!id) return;
    const fetchMeta = async () => {
      setLoading(true);
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        
        // Fetch current channel
        const res = await fetch(`${apiUrl}/api/channels?search=${id}`);
        if (res.ok) {
          const data = await res.json();
          const channel = data.find((c: any) => c.id === id);
          if (channel) {
             setChannelInfo(channel);
             
             // Fetch Wikipedia summary
             try {
                const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(channel.name)}`);
                if (wikiRes.ok) {
                    const wikiData = await wikiRes.json();
                    if (wikiData.extract) {
                        setWikiDescription(wikiData.extract);
                    }
                }
             } catch (e) {
                // Ignore wiki errors
             }

             // Fetch recommendations based on category or country
             const recRes = await fetch(`${apiUrl}/api/channels?limit=25&category=${channel.category || ''}`);
             if (recRes.ok) {
               const recData = await recRes.json();
               setRecommendations(recData.filter((c: any) => c.id !== id));
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
        
        {/* Theater Mode Top Player */}
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

        {/* Layout wrapper */}
        <div className={`flex flex-col lg:flex-row gap-6 ${isTheaterMode ? 'max-w-7xl mx-auto px-4' : ''}`}>
          
          {/* Main Content (Player/Info) */}
          <div className={`w-full ${isTheaterMode ? 'lg:w-[65%]' : 'lg:w-[70%] xl:w-[75%]'}`}>
            
            {/* Default Mode Player */}
            {!isTheaterMode && (
               <div className="w-full mb-4">
                 <StreamPlayer 
                    channelId={id} 
                    isTheaterMode={isTheaterMode}
                    onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
                 />
               </div>
            )}

            {/* Info Section */}
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
                  
                  {/* Channel Meta & Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 mb-4 border-b border-border/50">
                    {/* Left: Logo & Name */}
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
                        <span className="text-xs text-secondary">{channelInfo?.country || "International"} • 1.2K watching</span>
                      </div>

                      <button className="ml-4 px-5 py-2 bg-primary text-page rounded-full text-sm font-bold hover:bg-white/90 transition-colors shrink-0">
                        Follow
                      </button>
                    </div>

                    {/* Right: Actions */}
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
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied!");
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

                  {/* Description Box */}
                  <div className="bg-surface border border-border rounded-xl p-4 text-sm mt-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="font-bold mb-2 flex items-center gap-2">
                       {channelInfo?.category || "General"} Category
                    </div>
                    <p className="text-secondary leading-relaxed">
                      {wikiDescription || `Live broadcast of ${channelInfo?.name}. Available natively through HLS parsing and custom HTML5 video.`}
                    </p>
                  </div>
                </>
              )}

              {/* Theater Mode: Show Live Chat below description on Desktop */}
              {isTheaterMode && (
                <div className="hidden lg:block mt-6">
                   <LiveChatComponent />
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className={`w-full ${isTheaterMode ? 'lg:w-[35%]' : 'lg:w-[30%] xl:w-[25%]'} flex flex-col gap-6`}>
            
            {/* Live Chat (Default Mode or Mobile) */}
            <div className={`${isTheaterMode ? 'lg:hidden' : 'block'}`}>
               <LiveChatComponent />
            </div>

            {/* Recommendations */}
            <div className="flex flex-col">
              {/* Tabs */}
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
                  {recommendations.slice(0, 20).map((rec: any, idx) => (
                    <Link key={idx} href={`/channels/watch?id=${rec.id}`} className="flex gap-3 group">
                      <div className="w-40 shrink-0 relative aspect-video bg-elevated rounded-lg overflow-hidden border border-border group-hover:border-brand/50 transition-colors">
                         <img src={rec.logo || '/brand.png'} alt="" className="w-full h-full object-cover" />
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
                  
                  {recommendations.length > 0 && (
                     <div className="py-4 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-brand/20 border-t-brand rounded-full animate-spin"></div>
                     </div>
                  )}
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

function LiveChatComponent() {
  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col h-[500px]">
      <div className="p-3 border-b border-border flex items-center justify-between bg-page/50 rounded-t-xl">
        <div className="flex items-center gap-2 font-bold text-sm text-primary">
          <MessageSquare className="w-4 h-4" /> Live Chat
        </div>
        <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> 1,240
        </div>
      </div>
      
      {/* Mock Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
         {[
           { u: "User123", m: "Hello everyone!" },
           { u: "IPTVFan", m: "Is this stream stable for you guys?" },
           { u: "MovieBuff", m: "Yes, working perfectly here in 1080p." },
           { u: "SportsGuy", m: "Great quality." },
           { u: "NewViewer", m: "How do I turn on captions?" },
         ].map((msg, i) => (
            <div key={i} className="text-sm">
               <span className="font-bold text-tertiary mr-2">{msg.u}</span>
               <span className="text-primary">{msg.m}</span>
            </div>
         ))}
      </div>

      {/* Chat Input Placeholder */}
      <div className="p-3 border-t border-border bg-page/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
             <Shield className="w-4 h-4 text-brand" />
          </div>
          <div className="flex-1">
             <input type="text" placeholder="Chat..." className="w-full bg-surface border border-border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-brand/50 transition-colors" />
          </div>
        </div>
      </div>
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
