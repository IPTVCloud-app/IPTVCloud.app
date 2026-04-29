"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Send, Mail, MapPin, Phone, Globe, Shield, Zap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Browse Channels", href: "/channels" },
        { name: "Live EPG", href: "/epg" },
        { name: "Features", href: "/#features" },
        { name: "Mobile App", href: "/download" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/support" },
        { name: "Support Ticket", href: "/support/ticket" },
        { name: "Contact Us", href: "/support/contact" },
        { name: "System Status", href: "/status" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "DMCA Disclaimer", href: "/dmca" },
        { name: "Cookie Policy", href: "/cookies" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Send className="w-5 h-5" />, name: "Twitter" },
    { icon: <Globe className="w-5 h-5" />, name: "Global" },
    { icon: <Shield className="w-5 h-5" />, name: "Secure" },
    { icon: <Zap className="w-5 h-5" />, name: "Fast" },
  ];

  return (
    <footer className="bg-page border-t border-border/50 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Logo />
            <p className="text-secondary text-sm max-w-xs leading-relaxed">
              IPTVCloud is the world's leading cloud-based streaming platform, 
              providing access to 10,000+ global channels with ultra-low latency.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-secondary hover:text-brand hover:border-brand/50 transition-all cursor-pointer"
                >
                  {social.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                {column.title}
              </h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-secondary hover:text-brand transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-tertiary">
          <p>© {currentYear} IPTVCloud Inc. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
               All Systems Operational
            </div>
            <p>Built with Passion for Streamers.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
