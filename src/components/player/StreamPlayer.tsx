"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls, { type Level, type ManifestParsedData, type ErrorData } from "hls.js";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, 
  SkipForward, SkipBack, Subtitles, Moon, PictureInPicture, 
  AlertCircle
} from "lucide-react";
import { AmbientBackground } from "./AmbientBackground";
import { motion, AnimatePresence } from "framer-motion";

interface StreamPlayerProps {
  channelId: string;
  onNext?: () => void;
  onPrev?: () => void;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
}

export function StreamPlayer({ channelId, onNext, onPrev, isTheaterMode, onToggleTheater }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPip, setIsPip] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // DVR State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Settings state
  const [ambientMode, setAmbientMode] = useState(true);
  const [qualityLevel, setQualityLevel] = useState(-1); // -1 = auto
  const [levels, setLevels] = useState<Level[]>([]);
  const [showCaptions, setShowCaptions] = useState(false);
  const [captionLang, setCaptionLang] = useState("English (Auto)");
  
  const [error, setError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Initialize HLS
  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    const streamUrl = `${apiUrl}/api/channels/stream?id=${channelId}`;

    const initHls = () => {
      Promise.resolve().then(() => {
        setIsBuffering(true);
        setError(null);
      });

      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          liveSyncDurationCount: 3,
        });
        hlsRef.current = hls;

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event: string, data: ManifestParsedData) => {
          setLevels(data.levels);
          video.play().catch(() => {
              setIsMuted(true);
              video.muted = true;
              video.play().catch(console.error);
          });
        });

        hls.on(Hls.Events.ERROR, (_event: string, data: ErrorData) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (data.response?.code === 404 || data.response?.code === 403) {
                  setError(data.response.code === 403 ? "Stream is geo-blocked." : "Stream is offline or unavailable.");
                  setIsBuffering(false);
                } else {
                  hls.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setError("Playback failed due to an unknown error.");
                setIsBuffering(false);
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => {
              setIsMuted(true);
              video.muted = true;
              video.play();
          });
        });
      } else {
         setError("Your browser does not support HLS playback.");
         setIsBuffering(false);
      }
    };

    initHls();

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
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(Math.max(video.duration, video.currentTime));
    };

    const handleVolume = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleEnterPiP = () => setIsPip(true);
    const handleLeavePiP = () => setIsPip(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolume);
    video.addEventListener("enterpictureinpicture", handleEnterPiP);
    video.addEventListener("leavepictureinpicture", handleLeavePiP);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("volumechange", handleVolume);
      video.removeEventListener("enterpictureinpicture", handleEnterPiP);
      video.removeEventListener("leavepictureinpicture", handleLeavePiP);
    };
  }, []);

  // Controls visibility timeout
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  }, [isPlaying, showSettings]);

  useEffect(() => {
    Promise.resolve().then(() => resetControlsTimeout());
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  // Actions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const val = parseFloat(e.target.value);
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP not supported or failed", err);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const handleQualityChange = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setQualityLevel(index);
      setShowSettings(false);
    }
  };

  const isLive = Math.abs(duration - currentTime) < 10;

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
        
        {/* Buffering Spinner */}
        {isBuffering && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-20 pointer-events-none">
             <div className="w-12 h-12 border-4 border-white/20 border-t-brand rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-30 px-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">Playback Error</h3>
            <p className="text-secondary max-w-md mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-brand rounded-full text-white font-medium hover:bg-accent transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          crossOrigin="anonymous"
          playsInline
          poster={`${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')}/api/channels/thumbnail?id=${channelId}`}
        />

        {/* Controls Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Bottom Bar Container */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
            
            {/* DVR Scrubber */}
            <div 
              onClick={handleSeek}
              className="h-1.5 w-full bg-white/20 rounded-full mb-4 relative group/progress cursor-pointer overflow-hidden"
            >
               <div 
                 className="absolute inset-y-0 left-0 bg-brand shadow-[0_0_8px_rgba(94,106,210,0.8)] transition-all duration-100"
                 style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
               ></div>
               <div 
                 className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-brand rounded-full scale-0 group-hover/progress:scale-100 transition-transform"
                 style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, transform: 'translate(-50%, -50%)' }}
               ></div>
            </div>

            <div className="flex items-end justify-between gap-4">
              {/* Left Controls */}
              <div className="flex items-center gap-4 text-white">
                <button onClick={onPrev} className="hover:opacity-80 transition-opacity" title="Previous Channel">
                   <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button onClick={togglePlay} className="hover:opacity-80 transition-opacity">
                  {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
                </button>

                <button onClick={onNext} className="hover:opacity-80 transition-opacity" title="Next Channel">
                   <SkipForward className="w-5 h-5 fill-current" />
                </button>

                <div className="flex items-center gap-2 group/volume">
                  <button onClick={toggleMute} className="hover:opacity-80 transition-opacity w-6 flex justify-center">
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 opacity-0 group-hover/volume:w-16 group-hover/volume:opacity-100 transition-all duration-300 accent-brand cursor-pointer h-1"
                  />
                </div>

                {/* DVR Time Display */}
                <div className="flex items-center gap-2 text-white font-medium text-[11px] md:text-xs">
                   {isLive ? (
                     <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded tracking-tighter">
                       <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                       LIVE
                     </span>
                   ) : (
                     <button 
                       onClick={() => { if(videoRef.current) videoRef.current.currentTime = duration; }}
                       className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-700 hover:bg-zinc-600 transition-colors rounded tracking-tighter"
                     >
                       BACK TO LIVE
                     </button>
                   )}
                   <span className="opacity-80 font-mono tracking-tighter">
                     {formatTime(currentTime)} / {formatTime(duration)}
                   </span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3 md:gap-5 text-white">
                {/* Captions Toggle */}
                <button 
                   onClick={() => setShowCaptions(!showCaptions)} 
                   className={`transition-opacity relative ${showCaptions ? 'text-brand' : 'text-white hover:opacity-80'}`}
                   title="Closed Captions (Auto-generated)"
                >
                  <Subtitles className="w-5 h-5 md:w-6 md:h-6" />
                  {showCaptions && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full" />}
                </button>

                {/* Settings Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSettings(!showSettings)} 
                    className={`hover:opacity-80 transition-transform duration-300 ${showSettings ? 'rotate-90 text-brand' : ''}`}
                  >
                    <Settings className="w-5 h-5 md:w-6 md:h-6" />
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
                        <div className="p-2 border-b border-white/10 mb-1">
                           <div className="text-white/50 text-[10px] mb-1 font-bold uppercase tracking-wider">Quality</div>
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

                        {/* CC Translation */}
                        <div className="p-2 border-b border-white/10 mb-1">
                           <div className="text-white/50 text-[10px] mb-1 font-bold uppercase tracking-wider">Subtitles / CC</div>
                           <button onClick={() => { setShowCaptions(true); setCaptionLang("English (Auto)"); }} className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-white/10 transition-colors ${captionLang === "English (Auto)" ? 'text-brand font-medium' : 'text-white'}`}>
                              English (Auto) {captionLang === "English (Auto)" && <span className="w-1.5 h-1.5 bg-brand rounded-full" />}
                           </button>
                           <button onClick={() => { setShowCaptions(true); setCaptionLang("Spanish (Auto-Translated)"); }} className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-white/10 transition-colors ${captionLang === "Spanish (Auto-Translated)" ? 'text-brand font-medium' : 'text-white'}`}>
                              Spanish (Auto) {captionLang === "Spanish (Auto-Translated)" && <span className="w-1.5 h-1.5 bg-brand rounded-full" />}
                           </button>
                           <button onClick={() => { setShowCaptions(true); setCaptionLang("French (Auto-Translated)"); }} className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-white/10 transition-colors ${captionLang === "French (Auto-Translated)" ? 'text-brand font-medium' : 'text-white'}`}>
                              French (Auto) {captionLang === "French (Auto-Translated)" && <span className="w-1.5 h-1.5 bg-brand rounded-full" />}
                           </button>
                           <button onClick={() => setShowCaptions(false)} className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-white/10 transition-colors ${!showCaptions ? 'text-brand font-medium' : 'text-white'}`}>
                              Off {!showCaptions && <span className="w-1.5 h-1.5 bg-brand rounded-full" />}
                           </button>
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PiP Mode */}
                {/* @ts-expect-error - Some browsers use webkit prefix */}
                {(document.pictureInPictureEnabled || document.webkitPictureInPictureEnabled) && (
                  <button onClick={togglePiP} className="hover:opacity-80 transition-opacity" title="Picture in Picture">
                    <PictureInPicture className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}

                {/* Theater Mode (Desktop only) */}
                {!isFullscreen && onToggleTheater && (
                   <button onClick={onToggleTheater} className="hidden md:block hover:opacity-80 transition-opacity" title="Theater Mode">
                     <div className="w-5 h-3 md:w-6 md:h-4 border-2 border-white rounded-[2px]" />
                   </button>
                )}

                {/* Fullscreen Toggle */}
                <button onClick={toggleFullscreen} className="hover:opacity-80 transition-opacity" title="Fullscreen">
                  {isFullscreen ? <Minimize className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pseudo-Captions Overlay */}
        {showCaptions && isPlaying && !error && (
          <div className="absolute bottom-20 md:bottom-24 left-0 right-0 flex justify-center pointer-events-none z-10 px-4">
             <div className="bg-black/80 px-4 py-1.5 rounded backdrop-blur text-white text-base md:text-lg font-medium tracking-wide text-center">
                [{captionLang}: Live transcription not connected]
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
