import { Sparkles, PlayCircle } from "lucide-react";

export function SmartRecommendations() {
  const recommendations = [
    { title: "UEFA Champions League", reason: "Because you watch Football", tag: "Live" },
    { title: "Fox News", reason: "Popular in your region (US)", tag: "News" },
    { title: "Late Night Comedy", reason: "Recommended for your viewing hours", tag: "Entertainment" },
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand" />
        <h2 className="text-lg font-medium tracking-[-0.165px] text-primary">For You</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((r, i) => (
          <div key={i} className="relative overflow-hidden bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-5 group hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PlayCircle className="w-16 h-16 text-brand" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] text-[10px] uppercase font-mono text-secondary rounded mb-3">
                {r.tag}
              </span>
              <h4 className="text-base font-medium text-primary mb-1">{r.title}</h4>
              <p className="text-[13px] text-tertiary">{r.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}