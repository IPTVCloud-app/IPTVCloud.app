"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State to handle fallback logic
  const [brandError, setBrandError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Reset errors when theme changes to try API again for the new theme
    setBrandError(false);
    setLogoError(false);
  }, [resolvedTheme]);

  const isDark = resolvedTheme === "dark";

  // GitHub Asset URLs (Fallback)
  const GITHUB_BASE = "https://raw.githubusercontent.com/IPTVCloud-app/assets/refs/heads/main";
  
  const githubBrand = isDark 
    ? `${GITHUB_BASE}/Brand/brand-white.svg` 
    : `${GITHUB_BASE}/Brand/brand.svg`;
    
  const githubLogo = isDark 
    ? `${GITHUB_BASE}/Logo/logo-white.svg` 
    : `${GITHUB_BASE}/Logo/logo.svg`;

  // API URLs (Primary)
  const apiBrand = `${API_URL}/api/image?src=Brand/${isDark ? 'brand-white.svg' : 'brand.svg'}`;
  const apiLogo = `${API_URL}/api/image?src=Logo/${isDark ? 'logo-white.svg' : 'logo.svg'}`;

  if (!mounted) {
    return <div className="h-6 w-32 bg-white/5 animate-pulse rounded" />;
  }

  return (
    <Link href="/" className="flex items-center">
      {/* Desktop Logo (Brand) */}
      <img
        src={brandError ? githubBrand : apiBrand}
        alt="IPTVCloud Brand"
        className="hidden md:block h-7 w-auto"
        onError={() => setBrandError(true)}
      />
      {/* Mobile Logo */}
      <img
        src={logoError ? githubLogo : apiLogo}
        alt="IPTVCloud Logo"
        className="md:hidden h-7 w-auto"
        onError={() => setLogoError(true)}
      />
    </Link>
  );
}
