import { Maximize, Minimize, Pause, PictureInPicture2, Play, Settings, SkipBack, SkipForward, Subtitles, Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SeekBar } from "./SeekBar";

type DesktopControlsProps = {
  isPlaying: boolean;
  togglePlay: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  updateVolume: (val: number) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isTheaterMode: boolean;
  onToggleTheater: () => void;
  isPiP: boolean;
  isFloatingMini: boolean;
  enterMiniPlayer: () => void;
  exitMiniPlayer: () => void;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
};

export function DesktopControls({
  isPlaying,
  togglePlay,
  isMuted,
  toggleMute,
  volume,
  updateVolume,
  isFullscreen,
  toggleFullscreen,
  isTheaterMode,
  onToggleTheater,
  isPiP,
  isFloatingMini,
  enterMiniPlayer,
  exitMiniPlayer,
  showSettings,
  setShowSettings,
  videoRef,
}: DesktopControlsProps) {
  const [ccEnabled, setCcEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
    };
  }, [videoRef]);

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipForward = () => {
      if (videoRef.current) {
          videoRef.current.currentTime += 10;
      }
  };

  const skipBackward = () => {
      if (videoRef.current) {
          videoRef.current.currentTime -= 10;
      }
  }

  const formatTime = (time: number) => {
      if (isNaN(time)) return "00:00";
      const h = Math.floor(time / 3600);
      const m = Math.floor((time % 3600) / 60);
      const s = Math.floor(time % 60);
      if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-0 inset-x-0 px-4 pb-2 pt-8 flex flex-col gap-2 pointer-events-auto">
      <SeekBar videoRef={videoRef} isLive={true} />
      
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          <button onClick={skipBackward} className="p-2 text-white/80 hover:text-white transition-colors" aria-label="Previous">
            <SkipBack className="w-5 h-5" fill="currentColor" />
          </button>
          
          <button onClick={togglePlay} className="p-2 text-white hover:scale-110 transition-transform" aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
          </button>

          <button onClick={skipForward} className="p-2 text-white/80 hover:text-white transition-colors" aria-label="Next">
            <SkipForward className="w-5 h-5" fill="currentColor" />
          </button>

          <div className="flex items-center gap-1 group/volume relative ml-2">
            <button onClick={toggleMute} className="p-2 text-white/80 hover:text-white transition-colors" aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-out origin-left flex items-center">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => updateVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 rounded-full accent-white bg-white/20 appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)` }}
              />
            </div>
          </div>
          
          <div className="text-white/90 text-sm font-medium tracking-wide flex items-center gap-1.5 ml-2 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/50">/</span>
            <span>{formatTime(duration)}</span>
            <button onClick={() => {if(videoRef.current) videoRef.current.currentTime = videoRef.current.duration}} className="flex items-center gap-1.5 ml-2 px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs font-bold tracking-wider">LIVE</span>
            </button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1">
          <button 
             onClick={() => setCcEnabled(!ccEnabled)} 
             className={`p-2 transition-colors relative ${ccEnabled ? 'text-white' : 'text-white/70 hover:text-white'}`}
             aria-label="Closed Captions"
          >
            <Subtitles className="w-5 h-5" />
            {ccEnabled && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />}
          </button>
          
          <button 
             onClick={() => setShowSettings(!showSettings)} 
             className={`p-2 transition-transform duration-300 hover:rotate-90 ${showSettings ? 'text-white' : 'text-white/70 hover:text-white'}`}
             aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button onClick={() => isPiP || isFloatingMini ? exitMiniPlayer() : enterMiniPlayer()} className="p-2 text-white/70 hover:text-white transition-colors" aria-label="Miniplayer">
            <PictureInPicture2 className="w-5 h-5" />
          </button>
          
          <button onClick={onToggleTheater} className="px-3 py-1.5 text-sm font-semibold tracking-wide border border-white/20 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-all mx-1">
            {isTheaterMode ? 'Exit Theater' : 'Theater mode'}
          </button>

          <button onClick={toggleFullscreen} className="p-2 text-white hover:scale-110 transition-transform" aria-label="Fullscreen">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}