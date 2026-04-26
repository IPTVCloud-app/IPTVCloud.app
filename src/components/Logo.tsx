"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a fallback or skeleton to prevent hydration mismatch
  if (!mounted) {
    return (
      <Link href="/" className="font-medium text-primary flex items-center gap-2 text-sm tracking-[-0.28px]">
        <span className="w-4 h-4 rounded bg-brand inline-block"></span>
        IPTVCloud
      </Link>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Link href="/" className="flex items-center">
      {/* Desktop Logo */}
      <img
        src={isDark ? "/brand-white.png" : "/brand.png"}
        alt="IPTVCloud Logo"
        className="hidden md:block h-6 w-auto"
      />
      {/* Mobile Logo */}
      <img
        src={isDark ? "/logo-white.png" : "/logo.png"}
        alt="IPTVCloud Logo"
        className="md:hidden h-6 w-auto"
      />
    </Link>
  );
}