"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Menu, X, ChevronDown, Home, Compass, HelpCircle, 
  ShieldAlert, Book, FileText, Tv, CalendarDays, 
  LifeBuoy, Mail, Activity, History, ShieldCheck,
  LogIn, UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { 
      name: "Explore", 
      href: "/channels",
      icon: <Compass className="w-4 h-4" />,
      dropdown: [
        { name: "Browse Channels", href: "/channels", icon: <Tv className="w-4 h-4 text-brand" /> },
        { name: "Electronic Program Guide", href: "/epg", icon: <CalendarDays className="w-4 h-4 text-brand" /> },
      ]
    },
    { 
      name: "Support", 
      href: "/support",
      icon: <HelpCircle className="w-4 h-4" />,
      dropdown: [
        { 
          name: "Help Center", 
          href: "/support",
          icon: <LifeBuoy className="w-4 h-4 text-brand" />,
          subItems: [
            { name: "Support Ticket", href: "/support/ticket", icon: <FileText className="w-3.5 h-3.5" /> },
            { name: "Contact us", href: "/support/contact", icon: <Mail className="w-3.5 h-3.5" /> },
          ]
        },
        { 
          name: "System Status", 
          href: "/status",
          icon: <Activity className="w-4 h-4 text-brand" />,
          subItems: [
            { name: "Incidents", href: "/status/incidents", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          ]
        },
		{ name: "Changelogs", href: "/changelogs", icon: <History className="w-4 h-4 text-brand" /> }
      ]
    },
    { 
      name: "Legal", 
      href: "/legal",
      icon: <ShieldCheck className="w-4 h-4" />,
      dropdown: [
        { name: "Privacy Policy", href: "/privacy", icon: <Book className="w-4 h-4 text-brand" /> },
        { name: "Terms of Service", href: "/terms", icon: <FileText className="w-4 h-4 text-brand" /> },
        { name: "DMCA Disclaimer", href: "/dmca", icon: <ShieldAlert className="w-4 h-4 text-brand" /> },
      ]
    },
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300 ${
        isScrolled 
          ? "bg-[rgba(247,248,248,0.85)] dark:bg-[rgba(8,9,10,0.85)] backdrop-blur-md border-b border-border shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}>
        <div className="flex items-center gap-10">
          <Logo />

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li 
                key={link.name} 
                className="relative group"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div className="flex items-center gap-2 cursor-pointer">
                  <Link href={link.href} className="text-[13px] font-medium text-tertiary hover:text-primary transition-colors flex items-center gap-1.5">
                    {link.icon}
                    {link.name}
                  </Link>
                  {link.dropdown && <ChevronDown className="w-3 h-3 text-quaternary" />}
                </div>

                {/* Dropdown Menu */}
                {link.dropdown && (
                  <AnimatePresence>
                    {activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl py-3 z-50 overflow-hidden"
                      >
                        {link.dropdown.map((item) => (
                          <div key={item.name} className="px-2 mb-1 last:mb-0">
                            <Link 
                              href={item.href} 
                              className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-secondary hover:text-primary hover:bg-hover rounded-lg transition-all"
                            >
                              {item.icon}
                              {item.name}
                            </Link>
                            {"subItems" in item && item.subItems && (
                              <div className="pl-10 pr-2 space-y-1 mt-1 pb-1">
                                {item.subItems.map((sub) => (
                                  <Link 
                                    key={sub.name} 
                                    href={sub.href}
                                    className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-tertiary hover:text-primary hover:bg-hover rounded-md transition-all"
                                  >
                                    {sub.icon}
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/account/signin" className="text-[13px] font-medium text-tertiary hover:text-primary transition-colors flex items-center gap-1.5">
            <LogIn className="w-4 h-4" />
            Login
          </Link>
          <Link href="/account/signup" className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all hover:bg-accent shadow-lg shadow-brand/20 active:scale-95">
            <UserPlus className="w-4 h-4" />
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-secondary p-2 bg-surface border border-border rounded-lg" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="md:hidden fixed inset-0 top-0 bg-background z-[100] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <Logo />
              <button className="text-secondary p-2 bg-surface border border-border rounded-lg" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-10 flex flex-col gap-10 min-h-[calc(100vh-65px)]">
              <ul className="flex flex-col gap-8">
                {navLinks.map((link) => (
                  <li key={link.name} className="flex flex-col gap-4">
                    <Link 
                      href={link.href} 
                      className="text-xl font-bold text-primary tracking-tight flex items-center gap-3"
                      onClick={() => !link.dropdown && setIsOpen(false)}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                    {link.dropdown && (
                      <ul className="pl-6 flex flex-col gap-5 border-l border-border/50 mt-2">
                        {link.dropdown.map((item) => (
                          <li key={item.name}>
                            <Link 
                              href={item.href} 
                              className="text-base font-semibold text-secondary flex items-center gap-3"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.icon}
                              {item.name}
                            </Link>
                            {"subItems" in item && item.subItems && (
                              <ul className="pl-7 mt-4 flex flex-col gap-4 border-l border-border/20">
                                {item.subItems.map((sub) => (
                                  <li key={sub.name}>
                                    <Link 
                                      href={sub.href} 
                                      className="text-sm font-medium text-tertiary hover:text-primary flex items-center gap-2.5"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      {sub.icon}
                                      {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto pt-10 border-t border-border flex flex-col gap-4 pb-12">
                <Link 
                  href="/account/signin" 
                  className="flex items-center justify-center gap-2 text-base font-bold text-primary text-center py-4 bg-surface border border-border rounded-xl active:scale-95 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="w-5 h-5 text-brand" />
                  Login
                </Link>
                <Link 
                  href="/account/signup" 
                  className="flex justify-center items-center gap-2 bg-brand text-white px-4 py-4 rounded-xl text-base font-bold transition-all hover:bg-accent shadow-xl shadow-brand/20 active:scale-95"
                  onClick={() => setIsOpen(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
