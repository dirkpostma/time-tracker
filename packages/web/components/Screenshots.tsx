import Image from "next/image";

const themes = [
  {
    src: "/screenshots/timer-midnight-aurora.png",
    alt: "Midnight Aurora theme",
    name: "Midnight Aurora",
    description: "Deep purple gradients",
  },
  {
    src: "/screenshots/timer-soft-blossom.png",
    alt: "Soft Blossom theme",
    name: "Soft Blossom",
    description: "Gentle pink tones",
  },
  {
    src: "/screenshots/timer-brutalist.png",
    alt: "Brutalist theme",
    name: "Brutalist",
    description: "Bold & minimal",
  },
  {
    src: "/screenshots/timer-ocean-depth.png",
    alt: "Ocean Depth theme",
    name: "Ocean Depth",
    description: "Calming blues",
  },
  {
    src: "/screenshots/timer-sunset-warmth.png",
    alt: "Sunset Warmth theme",
    name: "Sunset Warmth",
    description: "Warm amber glow",
  },
];

const screens = [
  {
    src: "/screenshots/history-screen.png",
    alt: "History screen",
    name: "History",
    description: "Track your progress",
  },
  {
    src: "/screenshots/settings-screen.png",
    alt: "Settings screen",
    name: "Settings",
    description: "Customize your experience",
  },
];

export function Screenshots() {
  return (
    <section
      id="screenshots"
      className="py-20 md:py-32 animated-gradient text-dark-text overflow-hidden"
      data-testid="screenshots-section"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Beautiful themes to
            <span className="block mt-1 gradient-text">match your style</span>
          </h2>
          <p className="mt-4 text-lg text-dark-text/70">
            Choose from five carefully crafted themes. Light or dark, minimal or vibrant.
          </p>
        </div>

        {/* Themes showcase - Featured */}
        <div className="mt-16 relative">
          {/* Main featured theme in center */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-primary rounded-[3rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity" />
              <Image
                src={themes[0].src}
                alt={themes[0].alt}
                width={280}
                height={606}
                className="relative rounded-[2.5rem] screenshot-shadow"
                data-testid="screenshot-image"
                priority
              />
            </div>
          </div>
        </div>

        {/* All themes grid */}
        <div className="mt-16 -mx-4 md:mx-0">
          {/* Mobile: Horizontal scroll */}
          <div className="flex gap-6 overflow-x-auto px-4 pb-4 snap-x snap-mandatory md:hidden scrollbar-hide">
            {themes.map((theme) => (
              <div
                key={theme.src}
                className="flex-shrink-0 snap-center"
              >
                <div className="relative group">
                  <Image
                    src={theme.src}
                    alt={theme.alt}
                    width={180}
                    height={390}
                    className="rounded-[2rem] shadow-2xl transition-transform group-hover:scale-105"
                    data-testid="screenshot-image"
                  />
                  <div className="mt-3 text-center">
                    <p className="font-medium text-dark-text">{theme.name}</p>
                    <p className="text-sm text-dark-text/60">{theme.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-5 gap-6">
            {themes.map((theme, index) => (
              <div
                key={theme.src}
                className="group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden rounded-[2rem]">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  <Image
                    src={theme.src}
                    alt={theme.alt}
                    width={200}
                    height={433}
                    className="w-full h-auto shadow-2xl transition-transform group-hover:scale-105"
                    data-testid="screenshot-image"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="font-medium text-dark-text">{theme.name}</p>
                    <p className="text-sm text-dark-text/70">{theme.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional screens */}
        <div className="mt-20 text-center">
          <h3 className="text-xl font-semibold text-dark-text/90 mb-8">
            And more screens to help you stay organized
          </h3>
          <div className="flex justify-center gap-8">
            {screens.map((screen) => (
              <div key={screen.src} className="group">
                <div className="relative overflow-hidden rounded-[2rem]">
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    width={160}
                    height={346}
                    className="shadow-2xl transition-transform group-hover:scale-105"
                    data-testid="screenshot-image"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="font-medium text-dark-text">{screen.name}</p>
                  <p className="text-sm text-dark-text/60">{screen.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
