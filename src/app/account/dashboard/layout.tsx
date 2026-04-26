import Link from "next/link";
import { LayoutDashboard, PlaySquare, Heart, Search, Radio, User, Shield, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const quickActions = [
    { name: "Dashboard", href: "/account", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Continue Watching", href: "#", icon: <PlaySquare className="w-4 h-4" /> },
    { name: "Open Favorites", href: "#", icon: <Heart className="w-4 h-4" /> },
    { name: "Search Channels", href: "#", icon: <Search className="w-4 h-4" /> },
    { name: "Live Now", href: "#", icon: <Radio className="w-4 h-4" /> },
  ];

  const settingsActions = [
    { name: "Profile Settings", href: "/account/profile", icon: <User className="w-4 h-4" /> },
    { name: "Privacy Settings", href: "/account/privacy", icon: <Shield className="w-4 h-4" /> },
    { name: "Personal Settings", href: "/account/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-page text-primary font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface sticky top-0 h-screen">
        <div className="p-6 border-b border-border">
          <Logo />
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
          <div>
            <div className="font-mono text-xs text-quaternary uppercase tracking-wider mb-3 px-2">Quick Actions</div>
            <ul className="space-y-1">
              {quickActions.map((action) => (
                <li key={action.name}>
                  <Link 
                    href={action.href} 
                    className="flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  >
                    <span className="text-tertiary">{action.icon}</span>
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
                    className="flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  >
                    <span className="text-tertiary">{action.icon}</span>
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
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-border">
          <Logo />
          <button className="text-tertiary">
             {/* Placeholder hamburger */}
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}