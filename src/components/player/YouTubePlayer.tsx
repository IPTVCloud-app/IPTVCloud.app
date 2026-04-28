"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipForward, SkipBack, Subtitles, Moon } from "lucide-react";
import { AmbientBackground } from "./AmbientBackground";
import { motion, AnimatePresence } from "framer-motion";

interface YouTubePlayerProps {
  channelId: string;
  onNext?: () => void;
  onPrev?: () => void;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
}

export function YouTubePlayer({ channelId, onNext, onPrev, isTheaterMode, onToggleTheater }: YouTubePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [ambientMode, setAmbientMode] = useState(true);
  const [qualityLevel, setQualityLevel] = useState(-1); // -1 = auto
  const [levels, setLevels] = useState<any[]>([]);
  const [showCaptions, setShowCaptions] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HLS
  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    const streamUrl = `${apiUrl}/api/channels/stream?id=${channelId}&hls=true`;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setLevels(data.levels);
        // Play automatically when loaded
        video.play().catch(e => {
            console.log("Autoplay prevented:", e);
            setIsMuted(true);
            video.muted = true;
            video.play().catch(console.error);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError("Fatal stream error");
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari native HLS support
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(e => {
            setIsMuted(true);
            video.muted = true;
            video.play();
        });
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channelId]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolume = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolume);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolume);
    };
  }, []);

  // Controls visibility timeout
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showSettings]);

  // Toggle Play
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // Volume Slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const val = parseFloat(e.target.value);
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Set Quality
  const handleQualityChange = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setQualityLevel(index);
      setShowSettings(false);
    }
  };

  return (
    <div className="relative group w-full" ref={containerRef}
         onMouseMove={resetControlsTimeout}
         onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
    >
      {/* Ambient Canvas */}
      {!isFullscreen && (
        <AmbientBackground videoRef={videoRef} isActive={ambientMode} />
      )}

      {/* Video Container */}
      <div className={`relative bg-black overflow-hidden w-full ${isTheaterMode ? 'aspect-[21/9]' : 'aspect-video rounded-xl shadow-2xl'}`}>
        {error ? (
           <div className="absolute inset-0 flex items-center justify-center text-white bg-black/80">
              <p className="text-sm font-medium">{error}</p>
           </div>
        ) : null}

        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          crossOrigin="anonymous"
          playsInline
        />

        {/* Controls Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
          
          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto flex items-end justify-between gap-4">
            
            {/* Left Controls */}
            <div className="flex items-center gap-4 text-white">
              <button onClick={onPrev} className="hover:opacity-80 transition-opacity" title="Previous Channel">
                 <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button onClick={togglePlay} className="hover:opacity-80 transition-opacity">
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
              </button>

              <button onClick={onNext} className="hover:opacity-80 transition-opacity" title="Next Channel">
                 <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="hover:opacity-80 transition-opacity w-8 flex justify-center">
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <input 
                  type="range" 
                  min="0" max="1" step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 accent-brand cursor-pointer"
                />
              </div>

              {/* Live Badge */}
              <div className="flex items-center gap-2 ml-2">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-xs font-bold uppercase tracking-wider text-white/90">Live</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-5 text-white">
              {/* Captions Toggle */}
              <button 
                 onClick={() => setShowCaptions(!showCaptions)} 
                 className={`transition-opacity ${showCaptions ? 'text-brand' : 'text-white hover:opacity-80'}`}
                 title="Closed Captions (Auto-generated)"
              >
                <Subtitles className="w-6 h-6" />
                {showCaptions && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full" />}
              </button>

              {/* Settings Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)} 
                  className={`hover:opacity-80 transition-transform duration-300 ${showSettings ? 'rotate-90' : ''}`}
                >
                  <Settings className="w-6 h-6" />
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-12 right-0 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 text-sm z-50 shadow-2xl"
                    >
                      {/* Quality */}
                      <div className="p-2 border-b border-white/10 mb-2">
                         <div className="text-white/50 text-xs mb-2 font-bold uppercase tracking-wider">Quality</div>
                         <button onClick={() => handleQualityChange(-1)} className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-white/10 transition-colors ${qualityLevel === -1 ? 'text-brand font-medium' : 'text-white'}`}>
                            Auto
                            {qualityLevel === -1 && <span className="w-1.5 h-1.5 bg-brand rounded-full" />}
                         </button>
                         {levels.map((l, idx) => (
                           <button key={idx} onClick={() => handleQualityChange(idx)} className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-white/10 transition-colors ${qualityLevel === idx ? 'text-brand font-medium' : 'text-white'}`}>
                              {l.height}p
                              {qualityLevel === idx && <span className="w-1.5 h-1.5 bg-brand rounded-full" />}
                           </button>
                         ))}
                      </div>

                      {/* Ambient Mode Toggle */}
                      <button onClick={() => setAmbientMode(!ambientMode)} className="w-full text-left px-4 py-2.5 rounded flex items-center justify-between hover:bg-white/10 transition-colors text-white">
                         <div className="flex items-center gap-3">
                           <Moon className="w-4 h-4 text-white/70" /> Ambient mode
                         </div>
                         <div className={`w-8 h-4 rounded-full transition-colors relative ${ambientMode ? 'bg-brand' : 'bg-white/20'}`}>
                           <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${ambientMode ? 'left-[18px]' : 'left-0.5'}`} />
                         </div>
                      </button>

                      {/* Sleep Timer */}
                      <button className="w-full text-left px-4 py-2.5 rounded flex items-center justify-between hover:bg-white/10 transition-colors text-white">
                         <div className="flex items-center gap-3">
                           <Play className="w-4 h-4 text-white/70" /> Sleep Timer
                         </div>
                         <span className="text-xs text-white/50">Off</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theater Mode (Desktop only) */}
              {!isFullscreen && onToggleTheater && (
                 <button onClick={onToggleTheater} className="hidden md:block hover:opacity-80 transition-opacity" title="Theater Mode">
                   <div className="w-6 h-4 border-2 border-white rounded-[2px]" />
                 </button>
              )}

              {/* Fullscreen Toggle */}
              <button onClick={toggleFullscreen} className="hover:opacity-80 transition-opacity" title="Fullscreen">
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Pseudo-Captions Overlay */}
        {showCaptions && isPlaying && (
          <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none">
             <div className="bg-black/70 px-4 py-1.5 rounded backdrop-blur text-white text-lg font-medium tracking-wide">
                [Captions not available for this stream]
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
