import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="py-16 px-8 border-t border-border bg-page text-sm relative z-10 w-full mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div>
          <div className="mb-6">
            <Logo />
          </div>
          <p className="text-tertiary text-body mb-6">Built for the future of IPTV streaming in the cloud.</p>
          <div className="flex gap-4">
            <Link href="https://github.com" target="_blank" aria-label="GitHub" className="text-tertiary hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.362.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </Link>
            <Link href="https://youtube.com" target="_blank" aria-label="YouTube" className="text-tertiary hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </Link>
            <Link href="https://twitter.com" target="_blank" aria-label="Twitter" className="text-tertiary hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.84 4.996 4.904 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-primary mb-6 uppercase tracking-wider text-xs">Product</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Features</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Integrations</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Pricing</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Changelog</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Documentation</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primary mb-6 uppercase tracking-wider text-xs">Company</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">About Us</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Blog</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Careers</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Customers</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Brand</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primary mb-6 uppercase tracking-wider text-xs">Resources</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Community</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Help Center</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Status</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Terms of Service</Link></li>
            <li><Link href="#" className="text-secondary hover:text-brand transition-colors block">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-tertiary">
        <p>© 2026 IPTVCloud.app. All rights reserved.</p>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
