export function WatchHistory() {
  const history = [
    { title: "Formula 1: Real Madrid vs Red Bull", channel: "Sports Prime", duration: "1h 45m", device: "Smart TV", time: "Today, 8:00 PM" },
    { title: "Evening News", channel: "Global News HD", duration: "30m", device: "iPhone", time: "Today, 6:30 PM" },
    { title: "Stranger Things", channel: "Cinema 4K", duration: "2h 10m", device: "MacBook", time: "Yesterday, 9:00 PM" },
  ];

  return (
    <section className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-lg font-medium tracking-[-0.165px] text-primary">Your Activity Log</h2>
        <div className="flex gap-2">
           <span className="text-xs text-tertiary cursor-pointer hover:text-primary">Today</span>
           <span className="text-xs text-quaternary">/</span>
           <span className="text-xs text-tertiary cursor-pointer hover:text-primary">Week</span>
        </div>
      </div>

      <div className="relative border-l border-border ml-3 space-y-6">
        {history.map((item, i) => (
          <div key={i} className="relative pl-6">
            <div className="absolute w-2 h-2 bg-brand rounded-full -left-[4.5px] top-1.5 ring-4 ring-page"></div>
            <div className="bg-surface border border-input rounded-lg p-4">
               <div className="flex justify-between items-start mb-1">
                 <h4 className="font-medium text-[14px] text-primary">{item.title}</h4>
                 <span className="text-[12px] font-mono text-quaternary">{item.time}</span>
               </div>
               <p className="text-[13px] text-secondary mb-2">{item.channel}</p>
               <div className="flex gap-3 text-[11px] font-mono text-tertiary uppercase">
                 <span>{item.duration}</span>
                 <span>•</span>
                 <span>{item.device}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}