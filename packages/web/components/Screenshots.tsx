import Image from "next/image";
import { Section } from "./ui/Section";

const screenshots = [
  {
    src: "/screenshots/timer-midnight-aurora.png",
    alt: "Midnight Aurora theme",
  },
  {
    src: "/screenshots/timer-soft-blossom.png",
    alt: "Soft Blossom theme",
  },
  {
    src: "/screenshots/timer-brutalist.png",
    alt: "Brutalist theme",
  },
  {
    src: "/screenshots/timer-ocean-depth.png",
    alt: "Ocean Depth theme",
  },
  {
    src: "/screenshots/timer-sunset-warmth.png",
    alt: "Sunset Warmth theme",
  },
  {
    src: "/screenshots/history-screen.png",
    alt: "History screen",
  },
  {
    src: "/screenshots/settings-screen.png",
    alt: "Settings screen",
  },
];

export function Screenshots() {
  return (
    <Section variant="light" id="screenshots" data-testid="screenshots-section">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-light-text md:text-4xl">
          Beautiful themes to match your style
        </h2>
        <p className="mt-4 text-lg text-muted">
          Choose from multiple carefully crafted themes
        </p>
      </div>
      <div className="mt-12 -mx-4 md:mx-0">
        {/* Mobile: Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory md:hidden">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.src}
              className="flex-shrink-0 snap-center"
            >
              <Image
                src={screenshot.src}
                alt={screenshot.alt}
                width={200}
                height={433}
                className="rounded-2xl shadow-lg"
                data-testid="screenshot-image"
              />
            </div>
          ))}
        </div>
        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-7 gap-4">
          {screenshots.map((screenshot) => (
            <div key={screenshot.src}>
              <Image
                src={screenshot.src}
                alt={screenshot.alt}
                width={200}
                height={433}
                className="rounded-2xl shadow-lg w-full h-auto"
                data-testid="screenshot-image"
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
