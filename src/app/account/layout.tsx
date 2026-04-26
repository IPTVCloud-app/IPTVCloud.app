import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page p-4 relative overflow-hidden">
      {/* Interactive/Subtle Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(94,106,210,0.15)_0%,transparent_70%)]"></div>
      </div>

      <div className="relative z-10 mb-8">
        <Logo />
      </div>

      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}