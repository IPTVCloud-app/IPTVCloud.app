"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlaySquare, Heart, Search, Radio, User, Shield, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import { useMousePosition, NodeNetwork } from "../Effects";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mouse = useMousePosition();
  const isAuthPage = pathname === "/account/signin" || pathname === "/account/signup" || pathname === "/account/forgot-password" || pathname === "/account/find-account";

  const quickActions = [
    { name: "Dashboard", href: "/account", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Continue Watching", href: "#", icon: <PlaySquare className="w-4 h-4" /> },
    { name: "Open Favorites", href: "#", icon: <Heart className="w-4 h-4" /> },
    { name: "Search Channels", href: "#", icon: <Search className="w-4 h-4" /> },
    { name: "Live Now", href: "#", icon: <Radio className="w-4 h-4" /> },
  ];

  const settingsActions = [
    { name: "Personal Settings", href: "/account/settings", icon: <Settings className="w-4 h-4" /> },
    { name: "Privacy Settings", href: "/account/settings/privacy", icon: <Shield className="w-4 h-4" /> },
    { name: "Credentials & Security", href: "/account/settings/credentials", icon: <User className="w-4 h-4" /> },
  ];

  if (isAuthPage) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-page p-4 relative overflow-hidden">
        {/* Interactive Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <NodeNetwork />
          <motion.div 
            className="absolute inset-0"
            animate={{ x: mouse.x * -0.5, y: mouse.y * -0.5 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          </motion.div>
        </div>

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

        <div className="w-full max-w-md relative z-20">
          <div className="flex justify-center mb-8">
            <Link href="/"><Logo /></Link>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-page text-primary font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface sticky top-[64px] h-[calc(100vh-64px)]">
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
          <div>
            <div className="font-mono text-xs text-quaternary uppercase tracking-wider mb-3 px-2">Quick Actions</div>
            <ul className="space-y-1">
              {quickActions.map((action) => (
                <li key={action.name}>
                  <Link 
                    href={action.href} 
                    className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === action.href 
                        ? "text-primary bg-[rgba(255,255,255,0.06)] shadow-sm shadow-black/5" 
                        : "text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.04)]"
                    }`}
                  >
                    <span className={pathname === action.href ? "text-brand" : "text-tertiary"}>{action.icon}</span>
                    {action.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs text-quaternary uppercase tracking-wider mb-3 px-2">Settings</div>
            <ul className="space-y-1">
              {settingsActions.map((action) => (
                <li key={action.name}>
                  <Link 
                    href={action.href} 
                    className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === action.href 
                        ? "text-primary bg-[rgba(255,255,255,0.06)]" 
                        : "text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.04)]"
                    }`}
                  >
                    <span className={pathname === action.href ? "text-brand" : "text-tertiary"}>{action.icon}</span>
                    {action.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium text-quaternary hover:text-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 lg:p-12 overflow-x-hidden">
        {/* Mobile Sidebar Trigger (Placeholder) */}
        <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-border">
          <span className="text-sm font-medium text-secondary uppercase tracking-wider">Dashboard</span>
          <button className="text-tertiary">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
