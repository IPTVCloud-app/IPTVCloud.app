"use client";

import { Check, ChevronLeft, Languages, Activity, Settings2, SlidersHorizontal, Settings } from "lucide-react";
import { useState } from "react";

type SettingsMenuProps = {
  availableQualities: Array<{ label: string; level: number }>;
  selectedLevel: number;
  applyQuality: (value: string) => void;
  isAmbientMode: boolean;
  setIsAmbientMode: (val: boolean) => void;
  isStableVolume: boolean;
  setIsStableVolume: (val: boolean) => void;
  showStats: boolean;
  setShowStats: (val: boolean) => void;
  onClose: () => void;
  isMobileMode: boolean;
};

type MenuState = "main" | "quality" | "cc";

export function SettingsMenu({
  availableQualities,
  selectedLevel,
  applyQuality,
  isAmbientMode,
  setIsAmbientMode,
  isStableVolume,
  setIsStableVolume,
  showStats,
  setShowStats,
  onClose,
  isMobileMode
}: SettingsMenuProps) {
  const [menuState, setMenuState] = useState<MenuState>("main");

  const getQualityLabel = () => {
    if (selectedLevel === -1) return "Auto";
    const q = availableQualities.find(q => q.level === selectedLevel);
    return q ? q.label : "Auto";
  };

  return (
    <div 
       className={`absolute ${isMobileMode ? 'top-4 right-4 max-h-[80vh] w-72' : 'bottom-16 right-4 max-h-[300px] w-64'} bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] flex flex-col text-sm`}
       onClick={(e) => e.stopPropagation()}
    >
      {/* Header for submenus */}
      {menuState !== "main" && (
        <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-white/5">
          <button onClick={() => setMenuState("main")} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="font-medium text-white">
            {menuState === "quality" ? "Quality" : "Captions"}
          </span>
        </div>
      )}

      <div className="overflow-y-auto custom-scrollbar p-2 flex flex-col gap-0.5">
        {menuState === "main" && (
          <>
            <button 
              onClick={() => setMenuState("quality")}
              className="flex items-center justify-between w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3 text-white/90 group-hover:text-white">
                <Settings2 className="w-4 h-4" />
                <span>Quality</span>
              </div>
              <div className="flex items-center gap-1 text-white/50 text-xs">
                <span>{getQualityLabel()}</span>
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </div>
            </button>

            <button 
              onClick={() => setMenuState("cc")}
              className="flex items-center justify-between w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3 text-white/90 group-hover:text-white">
                <Languages className="w-4 h-4" />
                <span>Captions</span>
              </div>
              <div className="flex items-center gap-1 text-white/50 text-xs">
                <span>Off</span>
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </div>
            </button>

            <div className="h-px w-full bg-white/10 my-1" />

            <button 
              onClick={() => setIsAmbientMode(!isAmbientMode)}
              className="flex items-center justify-between w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3 text-white/90 group-hover:text-white">
                <Settings className="w-4 h-4" />
                <span>Ambient mode</span>
              </div>
              <div className={`w-8 h-4 rounded-full transition-colors relative ${isAmbientMode ? 'bg-brand' : 'bg-white/20'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isAmbientMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            <button 
              onClick={() => setIsStableVolume(!isStableVolume)}
              className="flex items-center justify-between w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3 text-white/90 group-hover:text-white">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Stable volume</span>
              </div>
              <div className={`w-8 h-4 rounded-full transition-colors relative ${isStableVolume ? 'bg-brand' : 'bg-white/20'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isStableVolume ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            <div className="h-px w-full bg-white/10 my-1" />

            <button 
              onClick={() => setShowStats(!showStats)}
              className="flex items-center justify-between w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3 text-white/90 group-hover:text-white">
                <Activity className="w-4 h-4" />
                <span>Stats for nerds</span>
              </div>
              {showStats && <Check className="w-4 h-4 text-brand" />}
            </button>
          </>
        )}

        {menuState === "quality" && (
          <>
            <button
              onClick={() => { applyQuality("-1"); setMenuState("main"); onClose(); }}
              className="flex items-center gap-3 w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {selectedLevel === -1 && <Check className="w-4 h-4 text-white" />}
              </div>
              <span>Auto</span>
            </button>
            {availableQualities.map((q) => (
              <button
                key={q.level}
                onClick={() => { applyQuality(q.level.toString()); setMenuState("main"); onClose(); }}
                className="flex items-center gap-3 w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {selectedLevel === q.level && <Check className="w-4 h-4 text-white" />}
                </div>
                <span>{q.label}</span>
              </button>
            ))}
          </>
        )}

        {menuState === "cc" && (
          <>
            <div className="px-3 py-2 text-xs text-white/50 font-medium uppercase tracking-wider">Available Tracks</div>
            <button onClick={() => {setMenuState("main"); onClose();}} className="flex items-center gap-3 w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white">
              <div className="w-4 h-4 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
              <span>Off</span>
            </button>
            <button onClick={() => {setMenuState("main"); onClose();}} className="flex items-center gap-3 w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white/70">
              <div className="w-4 h-4" />
              <span>English (Auto-generated)</span>
            </button>
            <div className="h-px w-full bg-white/10 my-1" />
            <button className="flex items-center justify-between w-full p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white/90">
              <span>Auto-translate</span>
              <ChevronLeft className="w-4 h-4 rotate-180 text-white/50" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}