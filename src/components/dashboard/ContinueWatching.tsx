import { Play } from "lucide-react";

export function ContinueWatching() {
  const streams = [
    { title: "Premier League: ARS vs CHE", channel: "Sky Sports Main Event", progress: 65, time: "12 min ago" },
    { title: "Morning News", channel: "BBC News HD", progress: 20, time: "2 hours ago" },
    { title: "Inception (2010)", channel: "Cinema HD 1", progress: 85, time: "Yesterday" },
  ];

  return (
    <section className="mb-12">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-lg font-medium tracking-[-0.165px] text-primary">Resume Your Streams</h2>
        <button className="text-sm text-tertiary hover:text-primary transition-colors">View History</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((s, i) => (
          <div key={i} className="group bg-surface border border-input rounded-lg overflow-hidden cursor-pointer hover:border-border transition-colors">
            <div className="aspect-video bg-elevated relative flex items-center justify-center">
              <Play className="w-8 h-8 text-[rgba(255,255,255,0.2)] group-hover:text-white transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[rgba(255,255,255,0.1)]">
                <div className="h-full bg-brand" style={{ width: `${s.progress}%` }}></div>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-[15px] text-primary truncate">{s.title}</h4>
              <p className="text-[13px] text-secondary mt-1">{s.channel}</p>
              <p className="text-[11px] font-mono text-quaternary mt-3 uppercase tracking-wide">Last watched {s.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}