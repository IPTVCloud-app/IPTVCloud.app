"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Play, Globe, Sparkles, MonitorSmartphone, Zap, Server, Shield, Activity, BarChart, Tv, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Logo } from "@/components/Logo";
import { useMousePosition, NodeNetwork, GlitchText, Magnetic } from "./Effects";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="w-8 h-8 opacity-0" />
});

// --- Generic UI Primitives ---

function SectionReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(10px)", scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 1, 
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)" },
      }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

function ButtonBrand({ children, href, className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  const content = (
    <Magnetic>
      <span className={`inline-flex items-center justify-center bg-brand text-white px-5 py-2.5 rounded-md font-medium text-sm transition-all hover:bg-accent hover:shadow-[0_0_20px_rgba(94,106,210,0.4)] ${className}`}>
        {children}
      </span>
    </Magnetic>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function ButtonGhost({ children, href, className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  const content = (
    <Magnetic strength={0.3}>
      <span className={`inline-flex items-center justify-center bg-[rgba(255,255,255,0.02)] text-secondary border border-border px-5 py-2.5 rounded-md font-medium text-sm transition-all hover:bg-[rgba(255,255,255,0.04)] hover:border-input ${className}`}>
        {children}
      </span>
    </Magnetic>
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
    <h2 className="text-[32px] font-medium leading-tight tracking-[-0.704px] mb-8 text-primary [text-wrap:balance]">
      {children}
    </h2>
  );
}

// --- Page Sections ---
function HeroSection({ mousePosition }: { mousePosition: { x: number, y: number } }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const words = "Stream Everything. Instantly. Anywhere.".split(" ");

  if (!mounted) return (
    <section className="relative overflow-hidden pt-16 md:pt-24 pb-20 px-8 text-center flex flex-col items-center justify-center min-h-[70vh] opacity-0" />
  );

  return (
    <section className="relative overflow-hidden pt-16 md:pt-24 pb-20 px-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
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
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-xs font-medium text-secondary mb-8 hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-brand"></span>
          IPTVCloud 2.0 is now live
        </motion.div>

        <h1 className="text-[48px] md:text-[64px] lg:text-[72px] text-display text-primary mb-6 [text-wrap:balance] overflow-hidden leading-[1.1]">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.7, 
                delay: 0.1 + i * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98]
              }}
              className="inline-block mr-[0.2em]"
            >
              <GlitchText intensity={0.5}>{word}</GlitchText>
            </motion.span>
          ))}
        </h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-[18px] text-body text-tertiary max-w-2xl mb-10 [text-wrap:balance]"
        >
          Manage, discover, and stream live TV channels, VOD content, and global media — all in one fast, scalable IPTV cloud platform.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <ButtonBrand href="/signup" className="w-full sm:w-auto min-w-[140px]">Get Started</ButtonBrand>
          <ButtonGhost href="/channels" className="w-full sm:w-auto min-w-[140px]">Browse Channels</ButtonGhost>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-8 text-sm text-quaternary font-mono flex flex-col items-center gap-6"
        >
          <span>No credit card required • Setup in minutes • Cancel anytime</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-tertiary/40"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
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
      <SectionReveal>
        <SectionLabel>01 / Core Value</SectionLabel>
        <SectionTitle>Everything You Need to Stream Smarter</SectionTitle>
        
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <StaggerItem key={i}>
                <motion.div 
                  whileHover={{ y: -5, borderColor: "var(--border-input)" }}
                  className="bg-[rgba(255,255,255,0.02)] border border-input rounded-lg p-8 linear-shadow-card transition-all hover:bg-[rgba(255,255,255,0.03)] h-full"
                >
                  <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center mb-6">
                    {b.icon}
                  </div>
                  <h3 className="text-xl font-medium tracking-[-0.24px] text-primary mb-3">{b.title}</h3>
                  <p className="text-[15px] text-body text-tertiary">{b.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </SectionReveal>
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
      <SectionReveal>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <SectionLabel>02 / Marketplace</SectionLabel>
            <SectionTitle>Explore Content Like Never Before</SectionTitle>
          </div>
          <ButtonGhost className="mb-8 md:mb-0">View All Streams</ButtonGhost>
        </div>

        <StaggerContainer>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {streams.map((s, i) => (
              <StaggerItem key={i}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="group relative rounded-lg overflow-hidden border border-input bg-surface cursor-pointer h-full"
                >
                  <div className="aspect-video bg-hover relative">
                    {/* Fake thumbnail skeleton */}
                    <div className="absolute inset-0 bg-gradient-to-br from-elevated to-page opacity-50"></div>
                    <div className="absolute top-3 left-3 bg-[rgba(0,0,0,0.6)] backdrop-blur-md text-[10px] uppercase font-mono px-2 py-1 rounded text-primary">
                      {s.tag}
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-brand/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        <Play className="w-10 h-10 text-white fill-white ml-1" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-[15px] text-primary truncate">{s.title}</h4>
                    <p className="text-[13px] text-tertiary mt-1">{s.viewers} watching</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </SectionReveal>
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
       <SectionReveal>
         <SectionLabel>03 / Categories</SectionLabel>
         <SectionTitle>Organized for Speed & Simplicity</SectionTitle>

         <StaggerContainer>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             {categories.map((c, i) => (
               <StaggerItem key={i}>
                 <motion.div 
                   whileHover={{ y: -5, borderColor: "var(--accent)" }}
                   className="flex flex-col items-center justify-center p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-input hover:border-accent transition-all cursor-pointer group h-full"
                 >
                    <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.04)] group-hover:bg-brand/20 group-hover:text-brand text-tertiary flex items-center justify-center mb-3 transition-colors">
                      {c.icon}
                    </div>
                    <span className="text-[14px] font-medium text-secondary mb-1 text-center">{c.name}</span>
                    <span className="text-[12px] font-mono text-quaternary">{c.count} channels</span>
                 </motion.div>
               </StaggerItem>
             ))}
           </div>
         </StaggerContainer>
       </SectionReveal>
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
       <SectionReveal>
         <SectionTitle>Built for Performance & Scale</SectionTitle>

         <StaggerContainer>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {features.map((f, i) => (
               <StaggerItem key={i}>
                 <motion.div 
                   whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}
                   className="flex items-center gap-4 p-4 rounded-lg bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.08)] transition-all cursor-default h-full"
                 >
                    <div className="text-accent">{f.icon}</div>
                    <span className="text-[15px] text-secondary">{f.text}</span>
                 </motion.div>
               </StaggerItem>
             ))}
           </div>
         </StaggerContainer>
       </SectionReveal>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="py-32 px-8 text-center border-t border-border bg-surface relative overflow-hidden">
      <SectionReveal>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(94,106,210,0.1)_0%,transparent_70%)]"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-[48px] font-medium leading-tight tracking-[-1.056px] text-primary mb-6 [text-wrap:balance]">
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
      </SectionReveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-16 px-8 border-t border-border bg-page text-sm relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div>
          <div className="mb-6">
            <Logo />
          </div>
          <p className="text-tertiary text-body mb-6">Built for the future of IPTV streaming in the cloud.</p>
          <div className="flex gap-4">
            <Link href="https://github.com" target="_blank" aria-label="GitHub" className="text-tertiary hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.362.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </Link>
            <Link href="https://youtube.com" target="_blank" aria-label="YouTube" className="text-tertiary hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </Link>
            <Link href="https://twitter.com" target="_blank" aria-label="Twitter" className="text-tertiary hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.84 4.996 4.904 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>
            </Link>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-secondary mb-4">Features</h4>
          <ul className="space-y-3 text-tertiary flex flex-col">
            <Link href="/channels" className="hover:text-primary transition-colors">Browse channels</Link>
            <Link href="/epg" className="hover:text-primary transition-colors">Browse EPG</Link>
            <Link href="#" className="hover:text-primary transition-colors">New channels</Link>
            <Link href="/epg" className="hover:text-primary transition-colors">Electronic Program Guide</Link>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-secondary mb-4">Support</h4>
          <ul className="space-y-3 text-tertiary flex flex-col">
            <Link href="/support/ticket" className="hover:text-primary transition-colors">Ticket system</Link>
            <Link href="/status" className="hover:text-primary transition-colors">System status</Link>
            <Link href="/support" className="hover:text-primary transition-colors">Help center</Link>
            <Link href="/changelogs" className="hover:text-primary transition-colors">Changelogs</Link>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-secondary mb-4">Legal</h4>
          <ul className="space-y-3 text-tertiary flex flex-col">
            <Link href="/dmca" className="hover:text-primary transition-colors">DMCA Disclaimer</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[rgba(255,255,255,0.05)] text-quaternary text-xs gap-4">
        <div className="flex items-center gap-4">
          <span>© 2026 reinfyteam. All rights reserved.</span>
        </div>
        <div className="flex gap-4 md:mt-0">
          <Link href="https://github.com/IPTVCloud-app/IPTVCloud.app" target="_blank" className="hover:text-secondary transition-colors font-mono">Build: 97c35bc</Link>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const mouse = useMousePosition();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <div className="w-full flex flex-col font-sans relative overflow-x-hidden min-h-screen">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-brand z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Improved Spotlight Cursor Effect */}
      <motion.div
        className="fixed inset-0 z-10 pointer-events-none"
        animate={{
          background: [
            `radial-gradient(600px at ${mouse.rawX}px ${mouse.rawY}px, rgba(94, 106, 210, 0.08), transparent 80%)`,
            `radial-gradient(300px at ${mouse.rawX}px ${mouse.rawY}px, rgba(113, 112, 255, 0.05), transparent 60%)`
          ].join(', ')
        }}
      />

      {/* Grain / Noise Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Interactive Node Network Background */}
      <NodeNetwork />

      {/* Global Interactive Dot Matrix Background (Fixed Visibility) */}
      <motion.div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ y: backgroundY }}
        animate={{ x: mouse.x * -0.5, y: mouse.y * -0.5 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-page [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,#000_100%)] opacity-60"></div>
      </motion.div>
      
      <div className="relative z-10 flex flex-col">
        <HeroSection mousePosition={{ x: mouse.x, y: mouse.y }} />
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