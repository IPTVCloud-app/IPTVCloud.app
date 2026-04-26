import { Award } from "lucide-react";

export function ProfileInsightLayer() {
  const badges = [
    { name: "Night Streamer", desc: "Most active between 10PM and 2AM." },
    { name: "Sports Enthusiast", desc: "Top 5% of users watching live sports." },
    { name: "Global Explorer", desc: "Watched channels from 12 different countries." }
  ];

  return (
    <section className="mb-12">
       <h2 className="text-lg font-medium tracking-[-0.165px] text-primary mb-4">Your Streaming Personality</h2>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         {badges.map((b, i) => (
           <div key={i} className="flex flex-col items-center text-center p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-[14px] font-medium text-primary mb-1">{b.name}</h4>
              <p className="text-[12px] text-tertiary">{b.desc}</p>
           </div>
         ))}
       </div>
    </section>
  );
}