"use client";

import { Play, Pause, Settings, SkipBack, SkipForward, Maximize, Minimize, MessageSquare } from "lucide-react";
import { SeekBar } from "./SeekBar";

type MobileControlsProps = {
  isPlaying: boolean;
  togglePlay: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  showChat: boolean;
  setShowChat: (val: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
};

export function MobileControls({
  isPlaying,
  togglePlay,
  isFullscreen,
  toggleFullscreen,
  showSettings,
  setShowSettings,
  showChat,
  setShowChat,
  videoRef
}: MobileControlsProps) {

  // Double tap to seek logic could be added to an overlay div here, but for now we implement the visual buttons.

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-auto bg-black/40">
      {/* Top Bar */}
      <div className="flex justify-end items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowChat(!showChat); }} 
          className={`p-2 rounded-full backdrop-blur-md border transition-colors ${showChat ? 'bg-brand/20 text-brand border-brand/50' : 'bg-black/40 text-white/90 border-white/10 hover:text-white'}`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} 
          className="p-2 bg-black/40 rounded-full text-white/90 hover:text-white backdrop-blur-md border border-white/10"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Center Controls */}
      <div className="flex justify-center items-center gap-8">
        <button 
          onClick={(e) => { e.stopPropagation(); /* Prev Channel */ }} 
          className="p-3 bg-black/20 rounded-full text-white/80 hover:text-white backdrop-blur-sm"
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
          className="p-5 bg-black/40 rounded-full text-white backdrop-blur-md border border-white/10 shadow-xl"
        >
          {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); /* Next Channel */ }} 
          className="p-3 bg-black/20 rounded-full text-white/80 hover:text-white backdrop-blur-sm"
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
           <SeekBar videoRef={videoRef} isLive={true} />
           <button 
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} 
            className="text-white/90 hover:text-white p-1"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}