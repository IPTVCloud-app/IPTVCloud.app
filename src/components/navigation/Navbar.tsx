"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
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
    { name: "Home", href: "/" },
    { 
      name: "Explore", 
      href: "/search",
      dropdown: [
        { name: "Browse Channels", href: "/channels" },
        { name: "Electronic Program Guide", href: "/epg" },
      ]
    },
    { 
      name: "Support", 
      href: "/support",
      dropdown: [
        { 
          name: "Help Center", 
          href: "/support",
          subItems: [
            { name: "Support Ticket", href: "/support/ticket" },
            { name: "Contact us", href: "/support/contact" },
          ]
        },
        { 
          name: "System Status", 
          href: "/status",
          subItems: [
            { name: "Incidents", href: "/status/incidents" },
          ]
        },
		{ name: "Changelogs", href: "/changelogs" }
      ]
    },
    { 
      name: "Legal", 
      href: "/legal",
      dropdown: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "DMCA Disclaimer", href: "/dmca" },
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
                <div className="flex items-center gap-1 cursor-pointer">
                  <Link href={link.href} className="text-[13px] font-medium text-tertiary hover:text-primary transition-colors">
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
                        className="absolute top-full left-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-xl py-2 z-50"
                      >
                        {link.dropdown.map((item) => (
                          <div key={item.name} className="px-1">
                            <Link 
                              href={item.href} 
                              className="block px-3 py-2 text-[13px] font-medium text-secondary hover:text-primary hover:bg-hover rounded-md transition-colors"
                            >
                              {item.name}
                            </Link>
                            {"subItems" in item && item.subItems && (
                              <div className="pl-4 pb-1">
                                {item.subItems.map((sub) => (
                                  <Link 
                                    key={sub.name} 
                                    href={sub.href}
                                    className="block px-3 py-1.5 text-[12px] text-tertiary hover:text-primary transition-colors"
                                  >
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
          <Link href="/account/signin" className="text-[13px] font-medium text-tertiary hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/account/signup" className="inline-block bg-brand text-white px-4 py-2 rounded-md text-[13px] font-medium transition-colors hover:bg-accent shadow-lg shadow-brand/20">
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-secondary p-1" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 top-[65px] bg-background/98 backdrop-blur-md z-40 overflow-y-auto"
          >
            <div className="px-6 py-10 flex flex-col gap-8 min-h-[calc(100vh-65px)]">
              <ul className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <li key={link.name} className="flex flex-col gap-4">
                    <Link 
                      href={link.href} 
                      className="text-xl font-semibold text-primary tracking-tight"
                      onClick={() => !link.dropdown && setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                    {link.dropdown && (
                      <ul className="pl-4 flex flex-col gap-4 border-l-2 border-border mt-1">
                        {link.dropdown.map((item) => (
                          <li key={item.name}>
                            <Link 
                              href={item.href} 
                              className="text-base font-medium text-secondary"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.name}
                            </Link>
                            {"subItems" in item && item.subItems && (
                              <ul className="pl-4 mt-3 flex flex-col gap-3 border-l border-border/50">
                                {item.subItems.map((sub) => (
                                  <li key={sub.name}>
                                    <Link 
                                      href={sub.href} 
                                      className="text-sm text-tertiary hover:text-primary transition-colors"
                                      onClick={() => setIsOpen(false)}
                                    >
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
              <div className="mt-auto pt-10 border-t border-border flex flex-col gap-4 pb-10">
                <Link 
                  href="/login" 
                  className="text-base font-medium text-secondary text-center py-4 border border-border rounded-xl hover:bg-hover transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/account/signup" 
                  className="flex justify-center items-center bg-brand text-white px-4 py-4 rounded-xl text-base font-bold transition-colors hover:bg-accent shadow-xl shadow-brand/20"
                  onClick={() => setIsOpen(false)}
                >
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