"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MessageSquare, Send } from "lucide-react";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 7.719 8.502 11.25h-6.657l-5.214-6.817L4.99 21.25H1.68l7.73-8.235L1.248 2.25h6.827l4.717 6.233L18.244 2.25ZM16.083 19.25h1.832L7.139 4.25H5.173l10.91 15z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.478 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

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
    { icon: <TwitterIcon className="w-5 h-5" />, name: "Twitter", href: "https://twitter.com/iptvcloud" },
    { icon: <GithubIcon className="w-5 h-5" />, name: "GitHub", href: "https://github.com/iptvcloud" },
    { icon: <MessageSquare className="w-5 h-5" />, name: "Discord", href: "https://discord.gg/iptvcloud" },
    { icon: <Send className="w-5 h-5" />, name: "Telegram", href: "https://t.me/iptvcloud" },
  ];

  return (
    <footer className="app-chrome border-t border-border/50 pt-20 pb-10 px-6 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Logo />
            <p className="text-secondary text-sm max-w-xs leading-relaxed">
              IPTVCloud is the world&apos;s leading cloud-based streaming platform, 
              providing access to 10,000+ global channels with ultra-low latency.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-secondary hover:text-brand hover:border-brand/50 transition-colors cursor-pointer"
                  title={social.name}
                >
                  {social.icon}
                </a>
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
