import { Bell, ShieldAlert, Star } from "lucide-react";

export function Notifications() {
  const notifications = [
    { title: "New Sports Channel Added", desc: "Based on your favorites, you might like 'ESPN UHD'.", icon: <Star className="w-4 h-4 text-brand" />, unread: true },
    { title: "New Login Detected", desc: "A new login from Mac (Boston, US) was detected.", icon: <ShieldAlert className="w-4 h-4 text-accent" />, unread: false },
    { title: "Reminder", desc: "The Champions League final starts in 30 minutes.", icon: <Bell className="w-4 h-4 text-emerald" />, unread: false },
  ];

  return (
    <section className="mb-12">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-lg font-medium tracking-[-0.165px] text-primary">For You (Alerts)</h2>
        <button className="text-sm text-tertiary hover:text-primary transition-colors">Mark all read</button>
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <div key={i} className={`flex items-start gap-4 p-4 rounded-lg border ${n.unread ? 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]' : 'bg-[rgba(255,255,255,0.01)] border-transparent'}`}>
             <div className="mt-0.5">{n.icon}</div>
             <div>
               <h4 className={`text-[14px] ${n.unread ? 'font-medium text-primary' : 'text-secondary'}`}>{n.title}</h4>
               <p className="text-[13px] text-tertiary mt-1">{n.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
}