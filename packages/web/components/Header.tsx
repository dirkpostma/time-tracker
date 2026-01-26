"use client";

import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-light-bg/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
              <Image
                src="/logo.svg"
                alt="Time Tracker logo"
                fill
                className="object-cover"
                data-testid="header-logo"
              />
            </div>
            <span className="font-bold text-lg text-light-text hidden sm:block">
              Time Tracker
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-muted hover:text-light-text transition-colors hidden sm:block"
            >
              Features
            </Link>
            <Link
              href="#screenshots"
              className="text-sm text-muted hover:text-light-text transition-colors hidden sm:block"
            >
              Themes
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted hover:text-light-text transition-colors hidden sm:block"
            >
              Contact
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              data-testid="header-cta"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="hidden xs:inline">Download</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
