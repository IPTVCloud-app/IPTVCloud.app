import { Eye, Radio, Star, Smartphone, CheckCircle } from "lucide-react";

export function OverviewHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white text-xl font-medium linear-shadow-elevated">
          JD
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary">Good evening, John</h1>
            <CheckCircle className="w-4 h-4 text-emerald" />
          </div>
          <p className="text-sm text-tertiary">john.doe@example.com • Basic Plan</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
        <div className="bg-[rgba(255,255,255,0.02)] border border-input rounded-lg p-3 min-w-[120px]">
          <div className="flex items-center gap-2 text-quaternary mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs font-mono uppercase">Watch Time</span>
          </div>
          <div className="text-lg font-medium text-primary">2h 14m</div>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-input rounded-lg p-3 min-w-[120px]">
          <div className="flex items-center gap-2 text-quaternary mb-2">
            <Radio className="w-3.5 h-3.5" />
            <span className="text-xs font-mono uppercase">Active</span>
          </div>
          <div className="text-lg font-medium text-primary text-emerald">1 Stream</div>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-input rounded-lg p-3 min-w-[120px]">
          <div className="flex items-center gap-2 text-quaternary mb-2">
            <Star className="w-3.5 h-3.5" />
            <span className="text-xs font-mono uppercase">Favorites</span>
          </div>
          <div className="text-lg font-medium text-primary">24</div>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-input rounded-lg p-3 min-w-[120px]">
          <div className="flex items-center gap-2 text-quaternary mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-xs font-mono uppercase">Devices</span>
          </div>
          <div className="text-lg font-medium text-primary">3 / 5</div>
        </div>
      </div>
    </div>
  );
}