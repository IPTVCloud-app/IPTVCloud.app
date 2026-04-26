"use client";

import { motion } from "framer-motion";
import { Play, Globe, Sparkles, MonitorSmartphone, Zap, Server, Shield, Activity, BarChart, Tv } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

// --- Custom Hooks ---
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return mousePosition;
}

// --- Generic UI Primitives ---

function ButtonBrand({ children, href, className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  const content = (
    <span className={`inline-flex items-center justify-center bg-brand text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors hover:bg-accent ${className}`}>
      {children}
    </span>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function ButtonGhost({ children, href, className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  const content = (
    <span className={`inline-flex items-center justify-center bg-[rgba(255,255,255,0.02)] text-secondary border border-border px-5 py-2.5 rounded-md font-medium text-sm transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:border-input ${className}`}>
      {children}
    </span>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs text-quaternary uppercase tracking-wider mb-2">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[32px] font-medium leading-tight tracking-[-0.704px] mb-8 text-primary">
      {children}
    </h2>
  );
}

// --- Page Sections ---

function HeroSection({ mousePosition }: { mousePosition: { x: number, y: number } }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative overflow-hidden pt-32 pb-24 px-8 text-center flex flex-col items-center justify-center min-h-[80vh]">
      {/* Floating data nodes (interactive) */}
      {mounted && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
           <motion.div 
             animate={{ y: [0, -20, 0], x: mousePosition.x * 2, opacity: [0.5, 1, 0.5] }} 
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-brand shadow-[0_0_15px_rgba(94,106,210,0.8)]"
           />
           <motion.div 
             animate={{ y: [0, 20, 0], x: mousePosition.x * -1.5, opacity: [0.3, 0.8, 0.3] }} 
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-emerald shadow-[0_0_15px_rgba(16,185,129,0.8)]"
           />
           <motion.div 
             animate={{ y: [0, -15, 0], x: mousePosition.x * 1, opacity: [0.4, 0.9, 0.4] }} 
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
             className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_15px_rgba(113,112,255,0.8)]"
           />
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-xs font-medium text-secondary mb-8 hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-brand"></span>
          IPTVCloud 2.0 is now live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[48px] md:text-[64px] lg:text-[72px] text-display text-primary mb-6"
        >
          Stream Everything.<br/>Instantly. Anywhere.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[18px] text-body text-tertiary max-w-2xl mb-10"
        >
          Manage, discover, and stream live TV channels, VOD content, and global media — all in one fast, scalable IPTV cloud platform.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <ButtonBrand href="/signup" className="w-full sm:w-auto min-w-[140px]">Get Started</ButtonBrand>
          <ButtonGhost href="/channels" className="w-full sm:w-auto min-w-[140px]">Browse Channels</ButtonGhost>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-sm text-quaternary font-mono"
        >
          No credit card required • Setup in minutes • Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}

function ProductValueSection() {
  const benefits = [
    {
      icon: <Zap className="w-5 h-5 text-accent" />,
      title: "Ultra-Fast Streaming Engine",
      description: "Low-latency playback optimized for global IPTV delivery, ensuring zero buffering.",
    },
    {
      icon: <Globe className="w-5 h-5 text-emerald" />,
      title: "Global Channel Access",
      description: "Thousands of live TV channels organized by region, category, and language.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-brand" />,
      title: "Smart Discovery System",
      description: "AI-powered recommendations based on watch behavior and trending streams.",
    },
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto border-t border-border">
      <SectionLabel>01 / Core Value</SectionLabel>
      <SectionTitle>Everything You Need to Stream Smarter</SectionTitle>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((b, i) => (
          <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-input rounded-lg p-8 linear-shadow-card transition-colors hover:border-border hover:bg-[rgba(255,255,255,0.03)]">
            <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-6">
              {b.icon}
            </div>
            <h3 className="text-xl font-medium tracking-[-0.24px] text-primary mb-3">{b.title}</h3>
            <p className="text-[15px] text-body text-tertiary">{b.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DiscoverySection() {
  const streams = [
    { title: "Global News Net", viewers: "12.4k", tag: "Live" },
    { title: "Cinema Classics HD", viewers: "8.2k", tag: "Movies" },
    { title: "Premier Sports 1", viewers: "45.1k", tag: "Sports" },
    { title: "Nature Channel 4K", viewers: "5.3k", tag: "Docs" },
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <SectionLabel>02 / Marketplace</SectionLabel>
          <SectionTitle>Explore Content Like Never Before</SectionTitle>
        </div>
        <ButtonGhost className="mb-8 md:mb-0">View All Streams</ButtonGhost>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {streams.map((s, i) => (
          <div key={i} className="group relative rounded-lg overflow-hidden border border-input bg-surface cursor-pointer">
            <div className="aspect-video bg-hover relative">
              {/* Fake thumbnail skeleton */}
              <div className="absolute inset-0 bg-gradient-to-br from-elevated to-page opacity-50"></div>
              <div className="absolute top-3 left-3 bg-[rgba(0,0,0,0.6)] backdrop-blur-md text-[10px] uppercase font-mono px-2 py-1 rounded text-primary">
                {s.tag}
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-brand/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-[15px] text-primary truncate">{s.title}</h4>
              <p className="text-[13px] text-tertiary mt-1">{s.viewers} watching</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoriesSection() {
  const categories = [
    { name: "Sports Live", count: "1.2K", icon: <Activity className="w-4 h-4" /> },
    { name: "Movies & Series", count: "4.5K", icon: <Play className="w-4 h-4" /> },
    { name: "News Networks", count: "800", icon: <Globe className="w-4 h-4" /> },
    { name: "Kids & Family", count: "350", icon: <Sparkles className="w-4 h-4" /> },
    { name: "Music & Entertainment", count: "1.1K", icon: <Zap className="w-4 h-4" /> },
    { name: "International", count: "3.2K", icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto border-t border-border">
       <SectionLabel>03 / Categories</SectionLabel>
       <SectionTitle>Organized for Speed & Simplicity</SectionTitle>

       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         {categories.map((c, i) => (
           <div key={i} className="flex flex-col items-center justify-center p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-input hover:border-accent transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.04)] group-hover:bg-brand/20 group-hover:text-brand text-tertiary flex items-center justify-center mb-3 transition-colors">
                {c.icon}
              </div>
              <span className="text-[14px] font-medium text-secondary mb-1 text-center">{c.name}</span>
              <span className="text-[12px] font-mono text-quaternary">{c.count} channels</span>
           </div>
         ))}
       </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { text: "Multi-device support (TV, Mobile, Web)", icon: <MonitorSmartphone className="w-4 h-4" /> },
    { text: "EPG (Electronic Program Guide)", icon: <Tv className="w-4 h-4" /> },
    { text: "Adaptive bitrate streaming", icon: <BarChart className="w-4 h-4" /> },
    { text: "Cloud-based channel management", icon: <Server className="w-4 h-4" /> },
    { text: "99.9% uptime SLA", icon: <Activity className="w-4 h-4" /> },
    { text: "Secure and fast edge delivery", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto border-t border-border">
       <SectionTitle>Built for Performance & Scale</SectionTitle>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {features.map((f, i) => (
           <motion.div 
             key={i} 
             whileHover={{ x: 5 }}
             className="flex items-center gap-4 p-4 rounded-lg bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.08)] transition-colors cursor-default"
           >
              <div className="text-accent">{f.icon}</div>
              <span className="text-[15px] text-secondary">{f.text}</span>
           </motion.div>
         ))}
       </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="py-32 px-8 text-center border-t border-border bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(94,106,210,0.1)_0%,transparent_70%)]"></div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-[48px] font-medium leading-tight tracking-[-1.056px] text-primary mb-6">
          Ready to Upgrade Your IPTV Experience?
        </h2>
        <p className="text-[18px] text-body text-tertiary mb-10">
          Stream smarter. Manage easier. Scale globally.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <ButtonBrand href="/signup" className="min-w-[160px] py-3 text-base">Get Started Free</ButtonBrand>
          <ButtonGhost href="/channels" className="min-w-[160px] py-3 text-base">Browse Channels</ButtonGhost>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-16 px-8 border-t border-border bg-page text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div>
          <div className="font-medium text-primary mb-4 flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-brand inline-block"></span>
            IPTVCloud
          </div>
          <p className="text-tertiary text-body mb-6">Built for the future of IPTV streaming in the cloud.</p>
        </div>
        
        <div>
          <h4 className="font-medium text-secondary mb-4">Features</h4>
          <ul className="space-y-3 text-tertiary flex flex-col">
            <Link href="#" className="hover:text-primary transition-colors">Browse channels</Link>
            <Link href="#" className="hover:text-primary transition-colors">Browse EPG</Link>
            <Link href="#" className="hover:text-primary transition-colors">New channels</Link>
            <Link href="#" className="hover:text-primary transition-colors">Electronic Program Guide</Link>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-secondary mb-4">Support</h4>
          <ul className="space-y-3 text-tertiary flex flex-col">
            <Link href="#" className="hover:text-primary transition-colors">Ticket system</Link>
            <Link href="#" className="hover:text-primary transition-colors">System status</Link>
            <Link href="#" className="hover:text-primary transition-colors">Help center</Link>
            <Link href="#" className="hover:text-primary transition-colors">Changelogs</Link>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-secondary mb-4">Legal</h4>
          <ul className="space-y-3 text-tertiary flex flex-col">
            <Link href="#" className="hover:text-primary transition-colors">DMCA Disclaimer</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[rgba(255,255,255,0.05)] text-quaternary text-xs gap-4">
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span>© 2026 reinfyteam. All rights reserved.</span>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="#" className="hover:text-secondary transition-colors">@ReinfyTeam</Link>
          <Link href="#" className="hover:text-secondary transition-colors">GitHub</Link>
          <Link href="#" className="hover:text-secondary transition-colors">YouTube</Link>
          <Link href="#" className="hover:text-secondary transition-colors">Twitter</Link>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const mousePosition = useMousePosition();

  return (
    <div className="w-full flex flex-col font-sans relative overflow-x-hidden min-h-screen">
      {/* Global Interactive Dot Matrix Background */}
      <motion.div 
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
        animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#80808050_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-page [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,#000_100%)]"></div>
      </motion.div>
      
      <div className="relative z-10 flex flex-col">
        <Navbar />
        <HeroSection mousePosition={mousePosition} />
        <ProductValueSection />
        <DiscoverySection />
        <CategoriesSection />
        <FeaturesSection />
        <FinalCTASection />
        <Footer />
      </div>
    </div>
  );
}