"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Heart,
  Monitor,
  Play,
  Radio,
  Shield,
  Tv,
  Zap,
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { ChannelThumbnail } from "@/components/ChannelThumbnail";

const SHIMMER_CLASS =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

interface Channel {
  id: string;
  name: string;
  logo: string;
  category?: string;
  country?: string;
}

const platformStats = [
  { label: "Global channels", value: "10k+" },
  { label: "Live regions", value: "120+" },
  { label: "Playback latency", value: "Low" },
  { label: "Cloud profiles", value: "Sync" },
];

const featureCards = [
  {
    icon: Monitor,
    title: "Device continuity",
    text: "Continue watching across desktop, mobile, and TV without rebuilding your playlist.",
  },
  {
    icon: Shield,
    title: "Secure sessions",
    text: "Account access, comments, and favorites use authenticated cloud sessions.",
  },
  {
    icon: Globe,
    title: "Global discovery",
    text: "Browse by category, language, and country from one fast channel index.",
  },
  {
    icon: Heart,
    title: "Personal library",
    text: "Save favorites and build a cleaner route back to the channels you actually watch.",
  },
];

function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = typeof window !== "undefined" ? localStorage.getItem("cookie-consent") : null;
    if (!consent) {
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
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="card fixed bottom-4 left-4 right-4 z-[200] p-5 md:left-auto md:right-6 md:w-96"
    >
      <h3 className="text-heading-3 mb-2">Cookies & Experience</h3>
      <p className="mb-4 text-sm leading-relaxed text-secondary">
        We use cookies to remember preferences and keep the streaming interface stable between visits.
      </p>
      <div className="flex gap-3">
        <button onClick={accept} className="btn-brand">
          Accept All
        </button>
        <Link href="/cookies" className="btn-ghost flex-1">
          Learn More
        </Link>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [trendingChannels, setTrendingChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="app-page min-h-screen overflow-x-hidden">
      <section className="section-shell pt-24 pb-16 md:pt-32 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <span className="badge-subtle mb-5">
            <Radio className="h-3.5 w-3.5 text-emerald" />
            Live cloud TV
          </span>
          <h1 className="max-w-3xl text-[40px] font-[510] leading-none tracking-[-0.9px] text-primary md:text-[64px] md:tracking-[-1.4px]">
            Stream global channels from one quiet, fast interface.
          </h1>
          <p className="mt-6 max-w-2xl text-body-large text-secondary">
            IPTVCloud keeps live TV discovery, playback, favorites, and account tools in a minimal cloud app built for daily use.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/channels" className="btn-brand gap-2">
              Browse Channels <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/account/signup" className="btn-ghost gap-2">
              Create Account <Tv className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {platformStats.map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-surface/45 p-4 backdrop-blur-md">
              <div className="text-heading-3 text-primary">{item.value}</div>
              <div className="mt-1 text-sm text-tertiary">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-surface/20 py-16 backdrop-blur-sm">
        <div className="section-shell">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-mono-label text-quaternary">Live Index</span>
              <h2 className="mt-2 text-heading-1 text-primary">Trending now</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary">
                A live sample from the global channel library.
              </p>
            </div>
            <Link href="/channels" className="inline-flex items-center gap-2 text-sm font-[510] text-accent transition-colors hover:text-primary">
              View all channels <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border bg-surface/50 p-3">
                    <div className={`aspect-video rounded-md bg-elevated ${SHIMMER_CLASS}`} />
                    <div className="mt-4 flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-md bg-elevated ${SHIMMER_CLASS}`} />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className={`h-4 w-3/4 rounded bg-elevated ${SHIMMER_CLASS}`} />
                        <div className={`h-3 w-1/2 rounded bg-elevated ${SHIMMER_CLASS}`} />
                      </div>
                    </div>
                  </div>
                ))
              : trendingChannels.map((channel, idx) => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Link
                      href={`/channels/watch?id=${channel.id}`}
                      className="group block overflow-hidden rounded-lg border border-border bg-surface/50 transition-colors hover:border-brand/50 hover:bg-surface/80"
                    >
                      <div className="relative aspect-video bg-elevated">
                        <ChannelThumbnail
                          channelId={channel.id}
                          name={channel.name}
                          logoUrl={channel.logo}
                          className="h-full w-full border-0"
                        />
                        <div className="absolute left-2 top-2 badge-success text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                          LIVE
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
                            <Play className="h-4 w-4 fill-current" />
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-sm font-[590] leading-snug text-primary transition-colors group-hover:text-accent">
                          {channel.name}
                        </h3>
                        <p className="mt-2 text-xs text-tertiary">
                          {channel.category || "General"} / {channel.country || "Global"}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="mb-10 max-w-2xl">
          <span className="text-mono-label text-quaternary">Core Tools</span>
          <h2 className="mt-2 text-heading-1 text-primary">Built for repeat viewing</h2>
          <p className="mt-3 text-body-small text-secondary">
            Minimal controls, fast discovery, and account features that stay out of the way during playback.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-brand/20 bg-brand/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-heading-3 text-primary">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-shell pb-24">
        <div className="border-t border-border pt-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="badge-subtle mb-4">
                <Zap className="h-3.5 w-3.5" />
                Ready when you are
              </span>
              <h2 className="text-heading-1 text-primary">Open the live channel index.</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary">
                Start with live channels, then sign in when you want saved favorites and profile history.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/channels" className="btn-brand gap-2">
                Start Watching <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/account/signin" className="btn-ghost">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CookieConsent />
    </div>
  );
}
