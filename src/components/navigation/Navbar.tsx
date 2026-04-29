"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Menu, X, ChevronDown, Home, Compass, HelpCircle, 
  ShieldAlert, Book, FileText, Tv, CalendarDays, 
  LifeBuoy, Mail, Activity, History, ShieldCheck,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
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
        { name: "Live EPG", href: "/epg", icon: <CalendarDays className="w-4 h-4 text-brand" /> },
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
          hasSubItems: true,
          subItems: [
            { name: "Support Ticket", href: "/support/ticket", icon: <FileText className="w-3.5 h-3.5" /> },
            { name: "Contact us", href: "/support/contact", icon: <Mail className="w-3.5 h-3.5" /> },
          ]
        },
        { 
          name: "System Status", 
          href: "/status",
          icon: <Activity className="w-4 h-4 text-brand" />,
          hasSubItems: true,
          subItems: [
            { name: "Service Incidents", href: "/status/incidents", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
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
      <nav className={`sticky top-0 z-[100] flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300 ${
        isScrolled 
          ? "bg-page/80 backdrop-blur-xl border-b border-border/50 shadow-2xl" 
          : "bg-transparent border-b border-transparent"
      }`}>
        <div className="flex items-center gap-10">
          <Logo />

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li 
                key={link.name} 
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => {
                  setActiveDropdown(null);
                  setActiveSubMenu(null);
                }}
              >
                <div className="flex items-center gap-1.5 cursor-pointer py-2">
                  <Link href={link.href} className="text-[13px] font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
                    {link.icon}
                    {link.name}
                  </Link>
                  {link.dropdown && <ChevronDown className={`w-3 h-3 text-quaternary transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-[110]"
                    >
                      {link.dropdown.map((item) => (
                        <div 
                          key={item.name} 
                          className="relative"
                          onMouseEnter={() => item.hasSubItems && setActiveSubMenu(item.name)}
                          onMouseLeave={() => setActiveSubMenu(null)}
                        >
                          <Link 
                            href={item.href} 
                            className={`flex items-center justify-between px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all ${activeSubMenu === item.name ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-secondary hover:bg-white/5 hover:text-primary'}`}
                          >
                            <div className="flex items-center gap-3">
                               {item.icon}
                               {item.name}
                            </div>
                            {item.hasSubItems && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                          </Link>

                          {/* Sub-dropdown Menu */}
                          <AnimatePresence>
                            {item.hasSubItems && activeSubMenu === item.name && (
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="absolute left-full top-0 ml-1 w-56 bg-surface/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[120]"
                              >
                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 py-1.5 mb-1 border-b border-white/5">
                                   Available Actions
                                </div>
                                {item.subItems?.map((sub) => (
                                  <Link 
                                    key={sub.name} 
                                    href={sub.href}
                                    className="flex items-center gap-3 px-3 py-2 text-[12px] font-medium text-secondary hover:text-brand hover:bg-brand/10 rounded-xl transition-all"
                                  >
                                    {sub.icon}
                                    {sub.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Buttons */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link href="/account" className="text-[13px] font-medium text-tertiary hover:text-primary transition-colors flex items-center gap-1.5">
                <History className="w-4 h-4" />
                Dashboard
              </Link>
              <button 
                onClick={logout}
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all hover:bg-white/10 active:scale-95"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/account/signin" className="text-[13px] font-medium text-tertiary hover:text-primary transition-colors flex items-center gap-1.5">
                Sign In
              </Link>
              <Link href="/account/signup" className="flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-full text-[13px] font-bold transition-all hover:bg-accent shadow-lg shadow-brand/20 active:scale-95">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-white p-2.5 bg-white/5 border border-white/10 rounded-full" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 top-0 bg-page z-[200] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <Logo />
              <button className="text-white p-2.5 bg-white/5 border border-white/10 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-10 flex flex-col gap-10 min-h-[calc(100vh-65px)]">
              <ul className="flex flex-col gap-8">
                {navLinks.map((link) => (
                  <li key={link.name} className="flex flex-col gap-4">
                    <Link 
                      href={link.href} 
                      className="text-2xl font-bold text-primary tracking-tight flex items-center gap-3"
                      onClick={() => !link.dropdown && setIsOpen(false)}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                    {link.dropdown && (
                      <ul className="pl-6 flex flex-col gap-6 border-l border-border mt-2">
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
                            {item.subItems && (
                              <ul className="pl-7 mt-5 flex flex-col gap-5 border-l border-white/5">
                                {item.subItems.map((sub) => (
                                  <li key={sub.name}>
                                    <Link 
                                      href={sub.href} 
                                      className="text-sm font-medium text-tertiary flex items-center gap-3"
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
              
              <div className="mt-auto pt-10 border-t border-border/50 flex flex-col gap-4 pb-12">
                {user ? (
                  <>
                    <Link 
                      href="/account" 
                      className="flex items-center justify-center gap-2 text-base font-bold text-primary py-4 bg-surface border border-border rounded-2xl"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => { logout(); setIsOpen(false); }}
                      className="flex justify-center items-center gap-2 bg-zinc-800 text-white py-4 rounded-2xl text-base font-bold"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/account/signin" 
                      className="flex items-center justify-center gap-2 text-base font-bold text-primary py-4 bg-surface border border-border rounded-2xl"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/account/signup" 
                      className="flex justify-center items-center gap-2 bg-brand text-white py-4 rounded-2xl text-base font-bold shadow-xl shadow-brand/20"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
