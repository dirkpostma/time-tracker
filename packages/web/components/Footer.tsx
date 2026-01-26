import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="bg-dark-bg py-12 text-dark-text"
      data-testid="footer"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-8">
          {/* Top section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo and name */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                <Image
                  src="/logo.svg"
                  alt="Time Tracker logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-lg text-dark-text">
                Time Tracker
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-dark-text/60 hover:text-dark-text transition-colors"
                data-testid="footer-privacy-link"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-dark-text/60 hover:text-dark-text transition-colors"
                data-testid="footer-terms-link"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-dark-text/60 hover:text-dark-text transition-colors"
                data-testid="footer-contact-link"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-dark-text/20 to-transparent" />

          {/* Bottom section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-dark-text/50">
            <p data-testid="footer-copyright">
              &copy; 2025 Time Tracker. All rights reserved.
            </p>
            <p className="flex items-center gap-2">
              Made with
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              for freelancers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
