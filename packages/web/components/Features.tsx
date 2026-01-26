import { Section } from "./ui/Section";

const features = [
  {
    title: "One-Tap Tracking",
    description:
      "Start and stop time entries with a single tap. No complicated setup required.",
    icon: "play",
  },
  {
    title: "Clients & Projects",
    description:
      "Organize your work by client and project. Keep everything structured and easy to find.",
    icon: "folder",
  },
  {
    title: "History & Reports",
    description:
      "View your time entries by day, week, or month. See where your time goes.",
    icon: "chart",
  },
  {
    title: "Offline Support",
    description:
      "Track time even without internet. Everything syncs when you're back online.",
    icon: "cloud",
  },
  {
    title: "Beautiful Themes",
    description:
      "Choose from multiple stunning themes to match your style and mood.",
    icon: "palette",
  },
];

function FeatureIcon({ icon }: { icon: string }) {
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
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
      {icons[icon]}
    </div>
  );
}

export function Features() {
  return (
    <Section variant="light" id="features" data-testid="features-section">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-light-text md:text-4xl">
          Everything you need to track your time
        </h2>
        <p className="mt-4 text-lg text-muted">
          Simple, powerful features designed for freelancers
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            data-testid="feature-card"
          >
            <FeatureIcon icon={feature.icon} />
            <h3 className="mt-4 text-lg font-semibold text-light-text">
              {feature.title}
            </h3>
            <p className="mt-2 text-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
