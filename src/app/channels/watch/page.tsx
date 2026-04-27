"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Hls from "hls.js";
import Link from "next/link";
import { ArrowLeft, Star, Share2, MessageSquare, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function WatchPlayer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id || !videoRef.current) return;

    const video = videoRef.current;
    const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
    const streamUrl = `${apiUrl}/api/channels/${id}`; // Defaults to highest res

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(e => console.warn("Auto-play prevented", e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              setError("Fatal stream error. The channel might be offline.");
              setLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        setError("Failed to load stream. The channel might be offline.");
        setLoading(false);
      });
    } else {
      setError("HLS is not supported in this browser.");
      setLoading(false);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [id]);

  if (!id) {
    return <div className="p-12 text-center text-secondary">No channel ID provided.</div>;
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    // TODO: Connect to backend /api/account/favorites
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#08090a] text-primary flex flex-col lg:flex-row">
      {/* Left Column: Player & Info */}
      <div className="flex-1 lg:w-[70%] border-r border-border flex flex-col">
        {/* The Player Header */}
        <div className="px-4 py-3 flex items-center gap-4 bg-surface border-b border-border">
          <Link href="/channels" className="p-2 -ml-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
             <h1 className="text-sm font-medium">Channel View</h1>
             <p className="text-xs text-tertiary">{id}</p>
          </div>
        </div>

        {/* The Video Container */}
        <div className="w-full bg-black relative aspect-video">
          {loading && !error && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
               <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}
          {error && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 p-6 text-center">
               <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-80" />
               <p className="text-secondary">{error}</p>
             </div>
          )}
          <video 
            ref={videoRef}
            className="w-full h-full"
            controls
            autoPlay
            crossOrigin="anonymous"
          />
        </div>

        {/* Video Metadata / Actions */}
        <div className="p-4 md:p-6 bg-surface flex-1">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h2 className="text-xl font-medium text-primary mb-2 flex items-center gap-3">
                Live Broadcast
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold tracking-wider rounded">Live</span>
              </h2>
              <p className="text-sm text-tertiary max-w-2xl leading-relaxed">
                Currently streaming via IPTVCloud Engine. Program guide and schedule information will appear here once loaded from the backend.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  isFavorite ? "bg-brand/10 border-brand text-brand" : "bg-transparent border-border text-secondary hover:border-accent hover:text-primary"
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorite ? "fill-brand" : ""}`} /> 
                {isFavorite ? "Favorited" : "Favorite"}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-border hover:border-accent rounded-full text-sm font-medium text-secondary hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Chat & EPG (Placeholder) */}
      <div className="w-full lg:w-[30%] min-w-[320px] bg-surface flex flex-col h-[600px] lg:h-auto">
        <div className="flex border-b border-border">
          <button className="flex-1 py-4 text-sm font-medium text-brand border-b-2 border-brand">Live Chat</button>
          <button className="flex-1 py-4 text-sm font-medium text-secondary hover:text-primary transition-colors">Schedule (EPG)</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-col items-center justify-center h-full text-center text-tertiary">
            <MessageSquare className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">Connecting to chat server...</p>
            <p className="text-xs mt-1">Live comments powered by Supabase Realtime will appear here.</p>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-page">
          <input 
            type="text" 
            placeholder="Say something..." 
            className="w-full bg-surface border border-border focus:border-brand px-4 py-2.5 rounded-full text-sm outline-none transition-colors"
          />
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
