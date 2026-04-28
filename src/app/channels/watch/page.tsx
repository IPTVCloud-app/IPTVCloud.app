"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, notFound } from "next/navigation";
import { YouTubePlayer } from "@/components/player/YouTubePlayer";
import { ChannelSlider } from "@/components/ChannelSlider";
import { Star, Share2, AlertCircle, Info, ThumbsUp, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

const SHIMMER_CLASS = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

function WatchPlayer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [channelInfo, setChannelInfo] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

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
             
             // Fetch recommendations based on category or country
             const recRes = await fetch(`${apiUrl}/api/channels?limit=15&category=${channel.category || ''}`);
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
    <div className={`min-h-screen bg-page text-primary ${isTheaterMode ? 'pt-0' : 'p-4 md:p-8 lg:p-6'}`}>
      <div className={`mx-auto ${isTheaterMode ? 'max-w-full' : 'max-w-[1600px]'}`}>
        
        {/* Responsive Layout wrapper */}
        <div className={`flex flex-col ${isTheaterMode ? '' : 'lg:flex-row'} gap-6`}>
          
          {/* Main Content (Player + Info) */}
          <div className={`w-full ${isTheaterMode ? 'lg:w-full' : 'lg:w-[70%] xl:w-[75%]'}`}>
            
            {/* Player Container (Sticky on mobile) */}
            <div className={`w-full sticky top-0 z-50 bg-page ${isTheaterMode ? 'bg-black' : ''}`}>
              <div className={`${isTheaterMode ? 'max-w-7xl mx-auto' : ''}`}>
                 <YouTubePlayer 
                    channelId={id} 
                    isTheaterMode={isTheaterMode}
                    onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
                 />
              </div>
            </div>

            {/* Info Section */}
            <div className={`mt-4 ${isTheaterMode ? 'max-w-7xl mx-auto px-4' : ''}`}>
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

                      <button className="ml-4 px-4 py-2 bg-primary text-page rounded-full text-sm font-bold hover:bg-white/90 transition-colors">
                        Subscribe
                      </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                      <div className="flex items-center bg-surface border border-border rounded-full">
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors rounded-l-full border-r border-border">
                          <ThumbsUp className="w-4 h-4" /> <span className="text-sm font-medium">124</span>
                        </button>
                      </div>

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
                        onClick={() => toast.success("Feature coming soon!")}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full hover:bg-white/5 transition-colors whitespace-nowrap"
                      >
                        <PlusCircle className="w-4 h-4" /> <span className="text-sm font-medium">Save</span>
                      </button>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="bg-surface border border-border rounded-xl p-4 text-sm mt-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="font-bold mb-1">
                      {channelInfo?.category || "General"} Category
                    </div>
                    <p className="text-secondary line-clamp-2">
                      Live stream of {channelInfo?.name}. Available natively through HLS parsing and custom HTML5 video.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column (Recommendations list) */}
          <div className={`w-full ${isTheaterMode ? 'max-w-7xl mx-auto mt-6' : 'lg:w-[30%] xl:w-[25%]'} flex flex-col gap-4 px-4 lg:px-0`}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-3 h-[90px]">
                  <div className={`w-40 shrink-0 bg-elevated rounded-lg ${SHIMMER_CLASS}`} />
                  <div className="flex flex-col gap-2 flex-1 py-1">
                     <div className={`h-4 w-full bg-elevated rounded ${SHIMMER_CLASS}`} />
                     <div className={`h-3 w-1/2 bg-elevated rounded ${SHIMMER_CLASS}`} />
                  </div>
                </div>
              ))
            ) : (
              <>
                {isTheaterMode && <h3 className="font-bold text-lg mb-2">Up Next</h3>}
                <div className={`${isTheaterMode ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex flex-col gap-3'}`}>
                  {recommendations.slice(0, isTheaterMode ? 12 : 15).map((rec: any, idx) => (
                    <a key={idx} href={`/channels/watch?id=${rec.id}`} className="flex gap-3 group">
                      <div className={`${isTheaterMode ? 'w-full' : 'w-40'} shrink-0 relative aspect-video bg-elevated rounded-lg overflow-hidden`}>
                         <img src={rec.logo || '/brand.png'} alt="" className="w-full h-full object-cover" />
                         <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px] font-bold">LIVE</div>
                      </div>
                      <div className="flex flex-col py-0.5 flex-1 min-w-0">
                         <span className="font-medium text-sm leading-tight text-primary group-hover:text-brand transition-colors line-clamp-2">
                           {rec.name}
                         </span>
                         <span className="text-xs text-secondary mt-1">{rec.category || 'General'}</span>
                         <span className="text-xs text-tertiary">{rec.country || 'International'}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sliding Categories (Bottom) */}
        {!isTheaterMode && recommendations.length > 0 && (
           <div className="mt-8 px-4 lg:px-0 border-t border-border/50 pt-8">
             <ChannelSlider title="Similar to this channel" channels={recommendations} />
           </div>
        )}
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
      `}</style>
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
