import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { DotMatrixCanvas } from "@/components/layout/DotMatrixCanvas";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IPTVCloud.app - Stream Everything. Instantly. Anywhere.",
  description: "Manage, discover, and stream live TV channels, VOD content, and global media — all in one fast, scalable IPTV cloud platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`antialiased dark ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-page text-primary min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <DotMatrixCanvas />
          <Navbar />
          <main className="relative z-10 flex-1 w-full">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
