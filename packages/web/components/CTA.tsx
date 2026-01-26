import Image from "next/image";
import Link from "next/link";
import { Section } from "./ui/Section";

export function CTA() {
  return (
    <Section variant="dark" id="cta" data-testid="cta-section">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Ready to track your time?
        </h2>
        <p className="mt-4 text-lg text-dark-text/80">
          Download Time Tracker and start tracking today. It&apos;s free to get
          started.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="#"
            className="inline-block transition-opacity hover:opacity-80"
            data-testid="cta-app-store"
          >
            <Image
              src="/app-store-badge.svg"
              alt="Download on the App Store"
              width={180}
              height={60}
            />
          </Link>
          <Link
            href="/contact"
            className="text-dark-text/80 hover:text-dark-text underline underline-offset-4"
            data-testid="cta-contact"
          >
            Have questions? Contact us
          </Link>
        </div>
      </div>
    </Section>
  );
}
