"use client";

import { useEffect, useState, useRef } from "react";

type SeekBarProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLive?: boolean;
};

export function SeekBar({ videoRef, isLive = true }: SeekBarProps) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "0:00";
    const h = Math.floor(timeInSeconds / 3600);
    const m = Math.floor((timeInSeconds % 3600) / 60);
    const s = Math.floor(timeInSeconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
        if (video.duration > 0) {
          setProgress((video.currentTime / video.duration) * 100);
        }
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", updateProgress);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [videoRef, isDragging]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    let clientX;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setProgress(pos * 100);
    videoRef.current.currentTime = pos * duration;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  const jumpToLive = () => {
    if (!videoRef.current) return;
    // Assuming HLS live stream, seeking to duration jumps to live edge
    if (duration > 0) {
      videoRef.current.currentTime = duration - 1; // 1 second behind absolute edge for stability
    }
  };

  // Determine if we are close to the live edge (within 10 seconds)
  const isAtLiveEdge = isLive && duration > 0 && (duration - currentTime) < 10;

  return (
    <div className="w-full group/seek relative px-2 py-1">
      {/* Timestamps */}
      <div className="flex justify-between items-center text-[11px] font-medium text-white/70 mb-1 opacity-0 group-hover/seek:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-2">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
        {isLive && (
          <button 
            onClick={jumpToLive}
            className={`flex items-center gap-1.5 transition-colors ${isAtLiveEdge ? 'text-red-500' : 'text-white/60 hover:text-white'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isAtLiveEdge ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-white/40'}`} />
            LIVE
          </button>
        )}
      </div>

      {/* Progress Bar Container */}
      <div 
        ref={progressBarRef}
        className="relative h-1 w-full bg-white/20 rounded-full cursor-pointer group-hover/seek:h-1.5 transition-all duration-200"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleSeek(e);
        }}
        onMouseMove={(e) => {
          handleMouseMove(e);
          if (isDragging) handleSeek(e);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => {
          handleMouseLeave();
          setIsDragging(false);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleSeek(e);
        }}
        onTouchMove={(e) => {
          if (isDragging) handleSeek(e);
        }}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Hover Indicator */}
        {hoverPosition !== null && (
          <div 
            className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full"
            style={{ width: `${hoverPosition}%` }}
          />
        )}
        
        {/* Buffered (would need hls.js buffered ranges to implement accurately, leaving placeholder for now) */}
        
        {/* Played Progress */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-brand rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />

        {/* Scrubber Knob */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/seek:opacity-100 group-hover/seek:scale-100 scale-50 transition-all duration-200 shadow-sm"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
    </div>
  );
}
