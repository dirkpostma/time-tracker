import Image from "next/image";
import Link from "next/link";

export function CTA() {
  return (
    <section
      id="cta"
      className="py-20 md:py-32 bg-light-bg relative overflow-hidden"
      data-testid="cta-section"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo icon */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 rounded-3xl overflow-hidden shadow-2xl pulse-glow">
              <Image
                src="/logo.svg"
                alt="Time Tracker"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-light-text md:text-4xl lg:text-5xl">
            Ready to take control of
            <span className="block mt-1 gradient-text">your time?</span>
          </h2>
          <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
            Download Time Tracker and start tracking your billable hours.
            Simple, beautiful, and built for freelancers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="#"
              className="inline-block transition-all hover:scale-105 hover:shadow-2xl"
              data-testid="cta-app-store"
            >
              <Image
                src="/app-store-badge.svg"
                alt="Download on the App Store"
                width={200}
                height={67}
              />
            </Link>
            <div className="flex items-center gap-2 text-muted">
              <span className="w-1 h-1 rounded-full bg-muted" />
              <span>Free to download</span>
            </div>
          </div>

          {/* Secondary link */}
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors group"
              data-testid="cta-contact"
            >
              <span>Questions? Get in touch</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Your data stays private</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Made with care</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
