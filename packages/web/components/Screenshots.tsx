import Image from "next/image";

const screens = [
  {
    src: "/screenshots/timer-stopped.png",
    alt: "Timer screen ready to start",
    name: "Start Tracking",
    description: "One tap to begin",
  },
  {
    src: "/screenshots/timer-running.png",
    alt: "Timer actively running",
    name: "Track Time",
    description: "See your progress live",
  },
  {
    src: "/screenshots/history.png",
    alt: "History screen showing time entries",
    name: "View History",
    description: "All your entries organized",
  },
  {
    src: "/screenshots/settings.png",
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
        {/* Header with prominent logo */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-3xl opacity-40 scale-150" />
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden shadow-2xl pulse-glow">
                <Image
                  src="/logo.svg"
                  alt="Time Tracker"
                  fill
                  className="object-cover"
                  data-testid="screenshots-logo"
                />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            See it in
            <span className="block mt-1 gradient-text">action</span>
          </h2>
          <p className="mt-4 text-lg text-dark-text/70">
            A clean, focused interface designed to get out of your way
          </p>
        </div>

        {/* Main showcase - Three phones in a row */}
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-[600px] h-[600px] bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-full blur-3xl" />
          </div>

          {/* Phone stack - Desktop */}
          <div className="hidden md:flex justify-center items-end gap-6 lg:gap-10 relative">
            {/* Left phone - Timer stopped */}
            <div className="relative group transform -rotate-6 translate-y-8">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src={screens[0].src}
                alt={screens[0].alt}
                width={220}
                height={476}
                className="relative rounded-[2rem] shadow-2xl transition-transform group-hover:scale-105"
                data-testid="screenshot-image"
              />
              <div className="mt-4 text-center opacity-70 group-hover:opacity-100 transition-opacity">
                <p className="font-medium text-dark-text">{screens[0].name}</p>
                <p className="text-sm text-dark-text/60">{screens[0].description}</p>
              </div>
            </div>

            {/* Center phone - Timer running (featured) */}
            <div className="relative group z-10">
              <div className="absolute -inset-6 bg-gradient-to-r from-primary via-accent to-primary rounded-[3.5rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity" />
              <Image
                src={screens[1].src}
                alt={screens[1].alt}
                width={280}
                height={606}
                className="relative rounded-[2.5rem] screenshot-shadow"
                data-testid="screenshot-image"
                priority
              />
              <div className="mt-4 text-center">
                <p className="font-semibold text-dark-text text-lg">{screens[1].name}</p>
                <p className="text-dark-text/70">{screens[1].description}</p>
              </div>
            </div>

            {/* Right phone - History */}
            <div className="relative group transform rotate-6 translate-y-8">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src={screens[2].src}
                alt={screens[2].alt}
                width={220}
                height={476}
                className="relative rounded-[2rem] shadow-2xl transition-transform group-hover:scale-105"
                data-testid="screenshot-image"
              />
              <div className="mt-4 text-center opacity-70 group-hover:opacity-100 transition-opacity">
                <p className="font-medium text-dark-text">{screens[2].name}</p>
                <p className="text-sm text-dark-text/60">{screens[2].description}</p>
              </div>
            </div>
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className="flex gap-6 overflow-x-auto px-4 pb-4 snap-x snap-mandatory md:hidden scrollbar-hide">
            {screens.map((screen, index) => (
              <div
                key={screen.src}
                className="flex-shrink-0 snap-center"
              >
                <div className="relative group">
                  {index === 1 && (
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-[2.5rem] opacity-20 blur-xl" />
                  )}
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    width={index === 1 ? 240 : 200}
                    height={index === 1 ? 519 : 433}
                    className={`relative rounded-[2rem] shadow-2xl ${index === 1 ? 'screenshot-shadow' : ''}`}
                    data-testid="screenshot-image"
                    priority={index === 1}
                  />
                  <div className="mt-3 text-center">
                    <p className="font-medium text-dark-text">{screen.name}</p>
                    <p className="text-sm text-dark-text/60">{screen.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings screen - separate showcase */}
        <div className="mt-20 text-center">
          <p className="text-dark-text/60 mb-6">Plus settings to customize your experience</p>
          <div className="flex justify-center">
            <div className="relative group">
              <Image
                src={screens[3].src}
                alt={screens[3].alt}
                width={160}
                height={346}
                className="rounded-[1.5rem] shadow-xl opacity-80 group-hover:opacity-100 transition-opacity"
                data-testid="screenshot-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
