"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AmbientBackground } from "./AmbientBackground";

type StreamPlayerProps = {
  channelId: string;
  isTheaterMode: boolean;
  onToggleTheater: () => void;
};

type TouchPoint = { x: number; y: number } | null;

export function StreamPlayer({ channelId, isTheaterMode, onToggleTheater }: StreamPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const touchStartRef = useRef<TouchPoint>(null);

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
  const [availableQualities, setAvailableQualities] = useState<Array<{ label: string; level: number }>>([]);
  const [selectedLevel, setSelectedLevel] = useState(-1);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const streamUrl = `${apiUrl}/api/channels/stream?id=${encodeURIComponent(channelId)}`;

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
            maxBufferLength: 45,
            maxMaxBufferLength: 90,
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

          hls.on(Hls.Events.FRAG_BUFFERED, () => setIsBuffering(false));
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data?.fatal) return;
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              return;
            }
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              return;
            }
            setError("Playback failed due to stream error.");
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
      } catch {
        // fallback handled below
      }
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

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (!touchStartRef.current) return;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    touchStartRef.current = null;

    // Simulated swipe gestures:
    // - Swipe up/down: enter/exit fullscreen
    // - Swipe right/left: enter/exit mini player
    if (absDy > 70 && absDy > absDx) {
      if (dy < 0) {
        void toggleFullscreen();
      } else if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {});
      }
      return;
    }

    if (absDx > 70 && absDx > absDy) {
      if (dx > 0) {
        void enterMiniPlayer();
      } else {
        void exitMiniPlayer();
      }
    }
  };

  return (
    <div
      ref={wrapperRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className={`relative overflow-hidden rounded-2xl border border-border bg-black transition-all duration-300 ${
        isFloatingMini ? "fixed bottom-4 right-4 z-[80] w-[min(360px,90vw)] shadow-2xl" : "w-full"
      } ${isFullscreen ? "rounded-none border-0" : ""}`}
    >
      <AmbientBackground videoRef={videoRef} isActive={!isMobileMode && !isFloatingMini} />

      <div className="relative aspect-video">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          autoPlay
          onClick={() => {
            void togglePlay();
          }}
        />

        {(isLoading || isBuffering) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45">
            <div className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isLoading ? "Loading stream..." : "Buffering..."}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
            <div className="flex max-w-md items-start gap-2 rounded-lg border border-red-400/40 bg-black/85 p-3 text-red-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-2 sm:p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              void togglePlay();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          {!isMobileMode && (
            <>
              <button
                onClick={toggleMute}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(event) => updateVolume(Number.parseFloat(event.target.value))}
                className="h-1.5 w-24 accent-brand"
                aria-label="Volume"
              />
            </>
          )}

          {availableQualities.length > 0 && (
            <select
              value={selectedLevel}
              onChange={(event) => applyQuality(event.target.value)}
              className="h-9 rounded-full border border-white/20 bg-black/50 px-3 text-xs text-white outline-none transition hover:bg-black/70"
              aria-label="Quality"
            >
              <option value={-1}>Auto</option>
              {availableQualities.map((quality) => (
                <option key={`${quality.level}-${quality.label}`} value={quality.level}>
                  {quality.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              void (isPiP || isFloatingMini ? exitMiniPlayer() : enterMiniPlayer());
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label={isPiP || isFloatingMini ? "Exit mini player" : "Enter mini player"}
          >
            <PictureInPicture2 className="h-4 w-4" />
          </button>

          <button
            onClick={onToggleTheater}
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
          >
            {isTheaterMode ? "Exit Theater" : "Theater"}
          </button>

          <button
            onClick={() => {
              void toggleFullscreen();
            }}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
