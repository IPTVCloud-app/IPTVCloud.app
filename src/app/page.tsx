"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Play, Shield, Zap, Globe, Monitor, 
  ArrowRight, Heart
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { ChannelThumbnail } from "@/components/ChannelThumbnail";
import { useMousePosition, NodeNetwork } from "./Effects";

const SHIMMER_CLASS = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

interface Channel {
  id: string;
  name: string;
  logo: string;
  category?: string;
  country?: string;
}

function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = typeof window !== 'undefined' ? localStorage.getItem("cookie-consent") : null;
    if (!consent) {
      // Delay to avoid immediate setState in effect if needed, though usually fine in simple cases
      // But the lint rule is strict.
      Promise.resolve().then(() => {
        setShow(true);
      });
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[200] bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-2xl shadow-2xl"
    >
      <h3 className="font-bold mb-2">Cookies & Experience</h3>
      <p className="text-xs text-secondary leading-relaxed mb-4">
        We use cookies to improve your streaming experience, analyze traffic, and remember your preferences. By continuing, you agree to our cookie policy.
      </p>
      <div className="flex gap-3">
        <button 
          onClick={accept}
          className="flex-1 bg-brand text-white py-2 rounded-lg text-xs font-bold hover:bg-accent transition-colors"
        >
          Accept All
        </button>
        <Link 
          href="/cookies"
          className="flex-1 bg-white/5 border border-border py-2 rounded-lg text-xs font-bold text-center hover:bg-white/10 transition-colors"
        >
          Learn More
        </Link>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [trendingChannels, setTrendingChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const mouse = useMousePosition();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_URL}/api/channels?limit=8&status=online`);
        if (res.ok) {
          const data = await res.json();
          setTrendingChannels(data);
        }
      } catch (err) {
        console.error("Home fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-page text-primary overflow-x-hidden relative">
      
      {/* Interactive Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <NodeNetwork />
        <motion.div 
          className="absolute inset-0"
          animate={{ x: mouse.x * -0.3, y: mouse.y * -0.3 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </motion.div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden">
          {/* Animated background blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />

          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-wider mb-6">
                <Zap className="w-3 h-3 fill-current" /> Next-Gen IPTV Experience
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                Watch Everything. <br />
                <span className="text-brand">Anywhere in the World.</span>
              </h1>
              <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
                Experience ultra-low latency streaming with 10,000+ global channels. 
                Built on modern cloud architecture for the most stable IPTV experience ever created.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/channels" className="group px-8 py-4 bg-brand text-white rounded-full font-bold flex items-center gap-2 transition-all hover:bg-accent hover:shadow-[0_0_30px_rgba(94,106,210,0.4)] hover:-translate-y-1">
                  Start Watching Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/account/signup" className="px-8 py-4 bg-surface border border-border text-primary rounded-full font-bold transition-all hover:bg-white/5 hover:border-brand/50">
                  Create Free Account
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trending Channels Grid */}
        <section className="py-20 px-6 bg-surface/30 border-y border-border/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-display">Trending Live Now</h2>
                <p className="text-secondary text-sm">Real-time previews of our most popular global broadcasts.</p>
              </div>
              <Link href="/channels" className="text-brand font-medium text-sm hover:text-accent transition-colors flex items-center gap-1">
                Browse All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className={`aspect-video bg-elevated rounded-xl ${SHIMMER_CLASS}`} />
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-elevated ${SHIMMER_CLASS}`} />
                      <div className="space-y-2 flex-1">
                        <div className={`h-4 bg-elevated rounded w-3/4 ${SHIMMER_CLASS}`} />
                        <div className={`h-3 bg-elevated rounded w-1/2 ${SHIMMER_CLASS}`} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                trendingChannels.map((channel, idx) => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/channels/watch?id=${channel.id}`} className="group block space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-border group-hover:border-brand/50 transition-all shadow-lg group-hover:shadow-brand/10">
                        <ChannelThumbnail 
                          channelId={channel.id} 
                          name={channel.name} 
                          logoUrl={channel.logo}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                           <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white shadow-lg">
                             <Play className="w-4 h-4 fill-current ml-0.5" />
                           </div>
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-[10px] font-bold text-white flex items-center gap-1 shadow-xl">
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> LIVE
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {channel.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={channel.logo} alt="" className="w-10 h-10 object-contain rounded-full bg-white/5 border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold shrink-0">
                             {channel.name[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-primary group-hover:text-brand transition-colors truncate">{channel.name}</h3>
                          <p className="text-xs text-secondary mt-0.5">{channel.category || 'General'} • {channel.country || 'Global'}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-display">
                Powerful Features <br />
                <span className="text-brand">Tailored for Viewers.</span>
              </h2>
              <p className="text-secondary max-w-2xl mx-auto">
                Everything you need for a world-class streaming experience, packed into one beautiful interface.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Monitor />, title: "Multi-Device Sync", text: "Watch on your TV, phone, or laptop. Your history and playlists sync everywhere." },
                { icon: <Shield />, title: "Secure & Anonymous", text: "Military-grade encryption for all connections. No logs, no tracking, just content." },
                { icon: <Globe />, title: "Geo-Bypass Engine", text: "Access content from any region with our integrated global proxy network." },
                { icon: <Heart />, title: "Community Focused", text: "Real-time chat, follow your favorite channels, and create custom collections." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col gap-4 p-8 rounded-3xl bg-surface/50 backdrop-blur-sm border border-border transition-all hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 group"
                >
                   <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0 group-hover:bg-brand group-hover:text-white transition-all duration-500">
                     {feature.icon}
                   </div>
                   <div>
                     <h3 className="font-bold text-xl mb-3 text-display">{feature.title}</h3>
                     <p className="text-secondary text-sm leading-relaxed">{feature.text}</p>
                   </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
           <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-brand to-accent p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-brand/20">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 relative z-10 text-display">Ready to level up your TV?</h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto relative z-10 text-body">Join 50,000+ active streamers today. No hidden fees, cancel anytime.</p>
              <Link href="/account/signup" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-brand rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl relative z-10 active:scale-95">
                Get Started for Free <ArrowRight className="w-4 h-4" />
              </Link>
           </div>
        </section>

        {/* Footer CTA (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-50 pointer-events-none">
           <Link href="/account/signup" className="pointer-events-auto flex items-center justify-center gap-2 w-full py-4 bg-brand text-white rounded-2xl font-bold shadow-2xl shadow-brand/40 animate-bounce-slow">
              Get Started for Free <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

      </div>

      <CookieConsent />

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
