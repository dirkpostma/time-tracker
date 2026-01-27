import Image from "next/image";
import Link from "next/link";
import { Section } from "./ui/Section";

export function Hero() {
  return (
    <Section variant="light" id="hero" className="pt-24 md:pt-32 overflow-hidden">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-between lg:gap-16">
        {/* Content */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:max-w-xl">
          {/* Logo + Badge combo */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-lg pulse-glow">
              <Image
                src="/logo.svg"
                alt="Time Tracker"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Now on iOS</span>
            </div>
          </div>

          <h1
            className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
            data-testid="hero-title"
          >
            <span className="text-light-text">Track time.</span>
            <br />
            <span className="gradient-text">Get paid.</span>
          </h1>

          <p
            className="mt-6 text-lg text-muted md:text-xl max-w-md"
            data-testid="hero-tagline"
          >
            The beautifully simple time tracker for freelancers. One tap to start, one tap to stop.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="#"
              className="inline-block transition-all hover:scale-105 hover:shadow-lg"
              data-testid="app-store-badge"
            >
              <Image
                src="/app-store-badge.svg"
                alt="Download on the App Store"
                width={180}
                height={60}
                priority
              />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 text-muted hover:text-light-text transition-colors group"
            >
              <span>See features</span>
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

        </div>

        {/* Hero Image - Creative logo and phone composition */}
        <div className="relative w-full max-w-sm lg:max-w-md">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full scale-150 opacity-50" />

          {/* Large floating logo behind phone */}
          <div className="absolute -top-8 -left-8 lg:-top-12 lg:-left-12 z-0">
            <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-[2rem] overflow-hidden opacity-20 rotate-12">
              <Image
                src="/logo.svg"
                alt=""
                fill
                className="object-cover"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative animate-float z-10">
            <Image
              src="/screenshots/timer-running.png"
              alt="Time Tracker app screenshot"
              width={350}
              height={758}
              className="mx-auto screenshot-shadow rounded-[2.5rem]"
              data-testid="hero-screenshot"
              priority
            />
          </div>

          {/* Small floating logo accent */}
          <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 z-20">
            <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden shadow-2xl pulse-glow animate-float-delayed">
              <Image
                src="/logo.svg"
                alt="Time Tracker"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Floating accent elements */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/10 rounded-2xl rotate-12 animate-float-delayed" />
        </div>
      </div>
    </Section>
  );
}
