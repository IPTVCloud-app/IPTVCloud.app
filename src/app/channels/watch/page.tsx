"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Star, Share2, MessageSquare, AlertCircle, 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  Info
} from "lucide-react";
import toast from "react-hot-toast";

function WatchPlayer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [channelInfo, setChannelInfo] = useState<any>(null);

  // Custom UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0); // Viewed session duration
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentRes, setCurrentRes] = useState("auto");
  const [isBuffering, setIsBuffering] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load Channel Metadata
  useEffect(() => {
    if (!id) return;
    const fetchMeta = async () => {
      try {
        const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
        const res = await fetch(`${apiUrl}/api/channels?search=${id}`);
        if (res.ok) {
          const data = await res.json();
          const channel = data.find((c: any) => c.id === id);
          if (channel) setChannelInfo(channel);
        }
      } catch (err) {}
    };
    fetchMeta();
  }, [id]);

  // 2. Stream Controller
  useEffect(() => {
    if (!id || !videoRef.current) return;

    const video = videoRef.current;
    const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
    const streamUrl = `${apiUrl}/api/channels/stream?id=${id}&res=${currentRes}`;

    const startStream = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentTime(0);
        setDuration(0);

        // Probe for geo-blocking
        const response = await fetch(streamUrl, { method: 'GET' });
        if (!response.ok) {
          if (response.status === 403) {
            const data = await response.json();
            setError(data.message || "This stream is geo-blocked in your region.");
          } else {
            setError("Channel is currently offline.");
          }
          setLoading(false);
          return;
        }

        video.src = streamUrl;
        video.load();

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => { setIsBuffering(false); setLoading(false); };
        const onTimeUpdate = () => {
          if (!video) return;
          setCurrentTime(video.currentTime);
          setDuration(prev => Math.max(prev, video.currentTime));
        };
        const onError = () => {
           setError("Failed to initialize playback. source incompatible.");
           setLoading(false);
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('error', onError);

        video.play().catch(() => setLoading(false));

        return () => {
          video.removeEventListener('play', onPlay);
          video.removeEventListener('pause', onPause);
          video.removeEventListener('waiting', onWaiting);
          video.removeEventListener('playing', onPlaying);
          video.removeEventListener('timeupdate', onTimeUpdate);
          video.removeEventListener('error', onError);
        };
      } catch (err) {
        setError("Network error connecting to stream.");
        setLoading(false);
      }
    };

    startStream();

    return () => {
      video.pause();
      video.src = "";
    };
  }, [id, currentRes]);

  // 3. UI Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play();
    else videoRef.current.pause();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  };

  // 4. Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch(e.key.toLowerCase()) {
        case 'k':
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'j':
          if (videoRef.current) videoRef.current.currentTime -= 10;
          break;
        case 'l':
          if (videoRef.current) videoRef.current.currentTime += 10;
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, isMuted, isFullscreen, duration]);

  if (!id) return <div className="p-12 text-center text-secondary">No channel ID provided.</div>;

  return (
    <div className="min-h-screen bg-page text-primary p-4 md:p-8 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        <Link href="/channels" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Explorer
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* YouTube Player Container */}
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
              className={`relative aspect-video bg-black rounded-xl overflow-hidden group border border-white/5 shadow-2xl ${isFullscreen ? 'rounded-none' : ''} ${!showControls ? 'cursor-none' : ''}`}
            >
              <video 
                ref={videoRef}
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
                playsInline
              />

              {/* Interaction Overlay */}
              <div 
                className="absolute inset-0 z-10"
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
              />

              {/* Status Overlays */}
              {(loading || isBuffering) && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-20 pointer-events-none">
                  <div className="w-12 h-12 border-4 border-white/20 border-t-brand rounded-full animate-spin"></div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-30 px-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Streaming Error</h3>
                  <p className="text-secondary max-w-md mb-6">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-brand rounded-full text-white font-medium hover:bg-accent transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Custom YouTube Controls */}
              <div className={`absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-4 px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                
                {/* Progress Bar (DVR Support) */}
                <div 
                  onClick={handleSeek}
                  className="h-1.5 w-full bg-white/20 rounded-full mb-4 relative group/progress cursor-pointer overflow-hidden"
                >
                   <div 
                     className="absolute inset-y-0 left-0 bg-brand shadow-[0_0_8px_rgba(94,106,210,0.8)] transition-all duration-100"
                     style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                   ></div>
                   <div 
                     className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-brand rounded-full scale-0 group-hover/progress:scale-100 transition-transform"
                     style={{ left: `${(currentTime / (duration || 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                   ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-brand transition-colors">
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                    </button>
                    
                    <div className="flex items-center gap-2 group/volume">
                      <button onClick={toggleMute} className="text-white hover:text-brand transition-colors">
                        {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                      </button>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-brand h-1"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                       {Math.abs(duration - currentTime) < 10 ? (
                         <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded text-[10px] tracking-tighter">
                           <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                           LIVE
                         </span>
                       ) : (
                         <button 
                           onClick={() => { if(videoRef.current) videoRef.current.currentTime = duration; }}
                           className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-700 hover:bg-zinc-600 transition-colors rounded text-[10px] tracking-tighter"
                         >
                           BACK TO LIVE
                         </button>
                       )}
                       <span className="opacity-80 font-mono tracking-tighter">
                         {formatTime(currentTime)} / {formatTime(duration)}
                       </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 relative">
                    <div className="relative">
                      <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`text-white hover:text-brand transition-all ${showSettings ? 'rotate-45 text-brand' : ''}`}
                      >
                        <Settings className="w-6 h-6" />
                      </button>
                      
                      {/* Quality Menu */}
                      {showSettings && (
                        <div className="absolute bottom-10 right-0 w-48 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50">
                           <div className="px-4 py-2 border-b border-white/5 text-xs font-bold text-secondary uppercase tracking-widest">Quality</div>
                           {["auto", "1080p", "720p", "480p", "SD"].map((res) => (
                             <button 
                               key={res}
                               onClick={() => { setCurrentRes(res); setShowSettings(false); }}
                               className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${currentRes === res ? 'text-brand font-bold bg-brand/5' : 'text-secondary'}`}
                             >
                               {res.toUpperCase()}
                               {currentRes === res && <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>}
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                    
                    <button onClick={toggleFullscreen} className="text-white hover:text-brand transition-colors">
                      <Maximize className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Info */}
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-page border border-border flex items-center justify-center p-2">
                    {channelInfo?.logo ? (
                      <img src={channelInfo.logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-brand/10 rounded flex items-center justify-center text-brand font-bold text-xl uppercase">
                        {channelInfo?.name?.substring(0, 1) || "C"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-primary mb-1">{channelInfo?.name || "Loading Channel..."}</h1>
                    <div className="flex items-center gap-3 text-sm text-tertiary">
                      <span className="px-2 py-0.5 bg-brand/10 text-brand rounded font-medium">{channelInfo?.category || "General"}</span>
                      <span>{channelInfo?.country || "International"}</span>
                      <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> fMP4 Adaptive</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setIsFavorite(!isFavorite);
                      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
                    }}
                    className={`p-2.5 rounded-lg border transition-all ${isFavorite ? 'bg-brand/10 border-brand text-brand shadow-sm' : 'bg-surface border-border text-secondary hover:border-brand'}`}
                  >
                    <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }}
                    className="p-2.5 rounded-lg bg-surface border border-border text-secondary hover:border-brand transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-all shadow-md shadow-brand/20">
                    Follow Channel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl flex flex-col h-[600px]">
              <div className="p-4 border-b border-border flex items-center justify-between bg-page/50 rounded-t-xl">
                <div className="flex items-center gap-2 font-bold text-sm tracking-tight uppercase text-secondary">
                  <MessageSquare className="w-4 h-4 text-brand" /> Live Chat
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 1,240 ONLINE
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand/5 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-brand/40" />
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">Join the conversation</h4>
                  <p className="text-sm text-tertiary">Sign in to chat with other viewers and join the community.</p>
                </div>
                <Link href="/signin" className="px-6 py-2 bg-surface border border-border hover:border-brand text-secondary rounded-full text-sm font-medium transition-all">
                  Sign In
                </Link>
              </div>
            </div>
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
