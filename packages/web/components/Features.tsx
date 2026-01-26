import { Section } from "./ui/Section";

const features = [
  {
    title: "One-Tap Tracking",
    description:
      "Start and stop time entries with a single tap. No complicated setup required.",
    icon: "play",
    color: "from-primary to-primary-light",
  },
  {
    title: "Clients & Projects",
    description:
      "Organize your work by client and project. Keep everything structured and easy to find.",
    icon: "folder",
    color: "from-accent to-accent-light",
  },
  {
    title: "History & Reports",
    description:
      "View your time entries by day, week, or month. See where your time goes.",
    icon: "chart",
    color: "from-primary to-accent",
  },
  {
    title: "Offline Support",
    description:
      "Track time even without internet. Everything syncs when you're back online.",
    icon: "cloud",
    color: "from-accent-light to-accent",
  },
  {
    title: "Beautiful Themes",
    description:
      "Choose from multiple stunning themes to match your style and mood.",
    icon: "palette",
    color: "from-primary-light to-primary",
  },
];

function FeatureIcon({ icon, colorClass }: { icon: string; colorClass: string }) {
  const icons: Record<string, React.ReactNode> = {
    play: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    folder: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    ),
    chart: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    cloud: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
    palette: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
  };

  return (
    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
      {icons[icon]}
    </div>
  );
}

export function Features() {
  return (
    <Section variant="light" id="features" data-testid="features-section">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-light-text md:text-4xl lg:text-5xl">
          Everything you need to
          <span className="gradient-text"> track your time</span>
        </h2>
        <p className="mt-4 text-lg text-muted">
          Simple, powerful features designed for freelancers who value their time
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`feature-card gradient-border p-6 ${
              index === features.length - 1 && features.length % 3 === 2
                ? "sm:col-span-2 lg:col-span-1"
                : ""
            }`}
            data-testid="feature-card"
          >
            <FeatureIcon icon={feature.icon} colorClass={feature.color} />
            <h3 className="mt-5 text-xl font-semibold text-light-text">
              {feature.title}
            </h3>
            <p className="mt-3 text-muted leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
