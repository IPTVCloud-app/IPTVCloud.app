"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  AlertTriangle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { AmbientBackground } from "./AmbientBackground";
import { DesktopControls } from "./DesktopControls";
import { MobileControls } from "./MobileControls";
import { SettingsMenu } from "./SettingsMenu";
import { MobileLiveChat } from "./MobileLiveChat";

type StreamPlayerProps = {
  channelId: string;
  isTheaterMode: boolean;
  onToggleTheater: () => void;
};

export function StreamPlayer({ channelId, isTheaterMode, onToggleTheater }: StreamPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFloatingMini, setIsFloatingMini] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  
  // Settings & DVR State
  const [availableQualities, setAvailableQualities] = useState<Array<{ label: string; level: number }>>([]);
  const [selectedLevel, setSelectedLevel] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isAmbientMode, setIsAmbientMode] = useState(true);
  const [isStableVolume, setIsStableVolume] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const streamUrl = `${apiUrl}/api/channels/stream?id=${encodeURIComponent(channelId)}`;

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, showSettings]);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying && !showSettings) {
      setShowControls(false);
    }
  }, [isPlaying, showSettings]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const updateMobileMode = () => setIsMobileMode(mediaQuery.matches);
    updateMobileMode();
    mediaQuery.addEventListener("change", updateMobileMode);
    return () => mediaQuery.removeEventListener("change", updateMobileMode);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenEl = document.fullscreenElement;
      setIsFullscreen(Boolean(fullscreenEl && wrapperRef.current && fullscreenEl === wrapperRef.current));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          onToggleTheater();
          break;
        case 'i':
          e.preventDefault();
          isPiP || isFloatingMini ? exitMiniPlayer() : enterMiniPlayer();
          break;
        case 'arrowup':
          e.preventDefault();
          updateVolume(Math.min(1, volume + 0.05));
          break;
        case 'arrowdown':
          e.preventDefault();
          updateVolume(Math.max(0, volume - 0.05));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPiP, isFloatingMini, onToggleTheater]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isActive = true;
    setError(null);
    setIsLoading(true);
    setIsBuffering(false);
    setAvailableQualities([]);
    setSelectedLevel(-1);

    const cleanupHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute("src");
      video.load();
    };

    const setup = async () => {
      try {
        const Hls = (await import("hls.js")).default;
        if (!isActive) return;

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            autoStartLoad: true,
            backBufferLength: 30,
            maxBufferLength: 60,
            maxMaxBufferLength: 120,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 6,
            capLevelToPlayerSize: true,
            abrEwmaFastLive: 2.0,
            abrEwmaSlowLive: 6.0,
            manifestLoadingTimeOut: 10000,
            levelLoadingTimeOut: 12000,
            fragLoadingTimeOut: 15000,
          });

          hlsRef.current = hls;
          hls.attachMedia(video);
          hls.loadSource(streamUrl);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const qualityList = hls.levels.map((level, idx) => ({
              label: level.height ? `${level.height}p` : `Level ${idx + 1}`,
              level: idx,
            }));
            setAvailableQualities(qualityList);
            setIsLoading(false);
            void video.play().catch(() => {});
          });

          hls.on(Hls.Events.FRAG_BUFFERING, () => setIsBuffering(true));
          hls.on(Hls.Events.FRAG_BUFFERED, () => setIsBuffering(false));
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data?.fatal) return;
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              console.warn("HLS Network Error, attempting recovery...");
              hls.startLoad();
              return;
            }
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              console.warn("HLS Media Error, attempting recovery...");
              hls.recoverMediaError();
              return;
            }
            setError("Playback failed due to a fatal stream error.");
          });
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          setIsLoading(false);
          void video.play().catch(() => {});
          return;
        }

        setError("This browser does not support HLS playback.");
      } catch {
        setError("Failed to initialize stream player.");
      }
    };

    void setup();

    return () => {
      isActive = false;
      cleanupHls();
    };
  }, [channelId, streamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play().catch(() => {});
      return;
    }
    video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const updateVolume = (nextVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  };

  const toggleFullscreen = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    await wrapper.requestFullscreen().catch(() => {});
  };

  const enterMiniPlayer = async () => {
    const video = videoRef.current;
    if (!video) return;

    if ((document as any).pictureInPictureEnabled && !video.disablePictureInPicture) {
      try {
        await (video as any).requestPictureInPicture();
        setIsPiP(true);
        setIsFloatingMini(false);
        return;
      } catch {}
    }
    setIsFloatingMini(true);
  };

  const exitMiniPlayer = async () => {
    if (document.pictureInPictureElement) {
      await (document as any).exitPictureInPicture?.().catch(() => {});
    }
    setIsPiP(false);
    setIsFloatingMini(false);
  };

  const applyQuality = (value: string) => {
    const nextLevel = Number.parseInt(value, 10);
    setSelectedLevel(nextLevel);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = nextLevel;
    }
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden bg-black transition-all duration-300 group ${
        isFloatingMini ? "fixed bottom-4 right-4 z-[80] w-[min(360px,90vw)] shadow-2xl rounded-2xl border border-border" : "w-full rounded-2xl border border-border"
      } ${isFullscreen ? "rounded-none border-0" : ""} ${!showControls && isPlaying ? "cursor-none" : ""}`}
    >
      {isAmbientMode && <AmbientBackground videoRef={videoRef} isActive={!isMobileMode && !isFloatingMini} />}

      <div className="relative aspect-video w-full h-full bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          autoPlay
          onClick={() => {
            if (isMobileMode) {
              setShowControls(!showControls);
            } else {
              void togglePlay();
            }
          }}
        />

        {(isLoading || isBuffering) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
            <div className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-white shadow-xl backdrop-blur-sm border border-white/10">
              <Loader2 className="h-5 w-5 animate-spin text-brand" />
              {isLoading ? "Loading stream..." : "Buffering..."}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="flex max-w-md items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-red-100 shadow-2xl">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-red-200">Stream Error</span>
                <span className="text-sm opacity-80">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Gradient overlays for controls visibility */}
        <div className={`absolute inset-x-0 bottom-0 z-20 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${showControls ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute inset-x-0 top-0 z-20 h-1/3 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 pointer-events-none ${showControls ? "opacity-100" : "opacity-0"}`} />

        {/* Controls Overlay */}
        <div className={`absolute inset-0 z-30 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {isMobileMode ? (
             <MobileControls 
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                showChat={showChat}
                setShowChat={setShowChat}
                videoRef={videoRef}
             />
          ) : (
            <DesktopControls
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                isMuted={isMuted}
                toggleMute={toggleMute}
                volume={volume}
                updateVolume={updateVolume}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                isTheaterMode={isTheaterMode}
                onToggleTheater={onToggleTheater}
                isPiP={isPiP}
                isFloatingMini={isFloatingMini}
                enterMiniPlayer={enterMiniPlayer}
                exitMiniPlayer={exitMiniPlayer}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                videoRef={videoRef}
            />
          )}
        </div>

        {showSettings && (
           <SettingsMenu
              availableQualities={availableQualities}
              selectedLevel={selectedLevel}
              applyQuality={applyQuality}
              isAmbientMode={isAmbientMode}
              setIsAmbientMode={setIsAmbientMode}
              isStableVolume={isStableVolume}
              setIsStableVolume={setIsStableVolume}
              showStats={showStats}
              setShowStats={setShowStats}
              onClose={() => setShowSettings(false)}
              isMobileMode={isMobileMode}
           />
        )}
        
        {isMobileMode && <MobileLiveChat isOpen={showChat} onClose={() => setShowChat(false)} />}
      </div>
    </div>
  );
}