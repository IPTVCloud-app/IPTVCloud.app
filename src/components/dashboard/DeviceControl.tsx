import { Smartphone, Tv, Laptop, MoreVertical, LogOut } from "lucide-react";

export function DeviceControl() {
  const devices = [
    { name: "Samsung Smart TV", type: "tv", location: "New York, US", time: "Active now", active: true },
    { name: "iPhone 14 Pro", type: "mobile", location: "New York, US", time: "2 hours ago", active: false },
    { name: "MacBook Pro", type: "desktop", location: "Boston, US", time: "Yesterday", active: false },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "tv": return <Tv className="w-5 h-5" />;
      case "desktop": return <Laptop className="w-5 h-5" />;
      default: return <Smartphone className="w-5 h-5" />;
    }
  };

  return (
    <section className="mb-12">
      <h2 className="text-lg font-medium tracking-[-0.165px] text-primary mb-4">Your Active Devices</h2>
      
      <div className="space-y-3">
        {devices.map((d, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary border border-border">
                {getIcon(d.type)}
              </div>
              <div>
                <h4 className="font-medium text-[14px] text-primary flex items-center gap-2">
                  {d.name}
                  {d.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald"></span>}
                </h4>
                <p className="text-[13px] text-tertiary mt-0.5">{d.location} • {d.time}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-quaternary hover:text-primary transition-colors border border-transparent hover:border-border rounded">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
              <button className="text-tertiary hover:text-primary p-2">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}