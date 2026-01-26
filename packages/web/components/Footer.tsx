import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="bg-dark-bg py-8 text-dark-text/60"
      data-testid="footer"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="hover:text-dark-text transition-colors"
              data-testid="footer-privacy-link"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-dark-text transition-colors"
              data-testid="footer-terms-link"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="hover:text-dark-text transition-colors"
              data-testid="footer-contact-link"
            >
              Contact
            </Link>
          </div>
          <p className="text-sm" data-testid="footer-copyright">
            &copy; 2025 Time Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
