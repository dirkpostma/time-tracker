import Image from "next/image";
import Link from "next/link";
import { Section } from "./ui/Section";

export function Hero() {
  return (
    <Section variant="light" id="hero">
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between lg:gap-12">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:max-w-lg">
          <h1
            className="text-4xl font-bold tracking-tight text-light-text md:text-5xl lg:text-6xl"
            data-testid="hero-title"
          >
            Time Tracker
          </h1>
          <p
            className="mt-4 text-lg text-muted md:text-xl"
            data-testid="hero-tagline"
          >
            Simple time tracking for freelancers
          </p>
          <Link
            href="#"
            className="mt-8 inline-block transition-opacity hover:opacity-80"
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
        </div>
        <div className="relative w-full max-w-xs lg:max-w-sm">
          <Image
            src="/screenshots/timer-midnight-aurora.png"
            alt="Time Tracker app screenshot"
            width={300}
            height={650}
            className="mx-auto drop-shadow-2xl"
            data-testid="hero-screenshot"
            priority
          />
        </div>
      </div>
    </Section>
  );
}
