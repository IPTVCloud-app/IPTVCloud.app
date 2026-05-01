"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, PlaySquare, Heart, User, Shield, Settings, LogOut, Bell, FileText } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const isAuthPage = pathname === "/account/signin" || pathname === "/account/signup" || pathname === "/account/forgot-password" || pathname === "/account/find-account" || pathname === "/account/reset-password";
  const isSignupPage = pathname === "/account/signup";

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user && !isAuthPage) {
      router.push("/account/signin");
    }
  }, [mounted, loading, user, isAuthPage, router]);

  const quickActions = [
    { name: "Dashboard", href: "/account", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Continue Watching", href: "/account/history", icon: <PlaySquare className="w-4 h-4" /> },
    { name: "Open Favorites", href: "/account/favorites", icon: <Heart className="w-4 h-4" /> },
    { name: "Notifications", href: "/account/notifications", icon: <Bell className="w-4 h-4" /> },
    { name: "Manage Posts", href: "/account/posts", icon: <FileText className="w-4 h-4" /> },
  ];

  const settingsActions = [
    { name: "Personal Settings", href: "/account/settings", icon: <Settings className="w-4 h-4" /> },
    { name: "Privacy Settings", href: "/account/settings/privacy", icon: <Shield className="w-4 h-4" /> },
    { name: "Credentials & Security", href: "/account/settings/credentials", icon: <User className="w-4 h-4" /> },
  ];

  if (!mounted || (loading && !isAuthPage)) {
    return <div className="min-h-screen bg-page flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand rounded-full border-t-transparent animate-spin"></div></div>;
  }

  if (isAuthPage) {
    return (
      <div className="app-page min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 md:p-8">
        <div className={`w-full ${isSignupPage ? "max-w-2xl" : "max-w-md"}`}>
          <div className="flex justify-center mb-8">
            <Link href="/"><Logo /></Link>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // Double check user exists before rendering dashboard layout
  if (!user && !isAuthPage) return null;

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
                        ? "text-primary bg-hover shadow-sm shadow-black/5" 
                        : "text-secondary hover:text-primary hover:bg-panel"
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
                        ? "text-primary bg-hover" 
                        : "text-secondary hover:text-primary hover:bg-panel"
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
          <button onClick={logout} className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium text-quaternary hover:text-primary hover:bg-panel transition-colors">
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
