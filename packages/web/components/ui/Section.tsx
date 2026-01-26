type SectionVariant = "light" | "dark";

interface SectionProps {
  variant?: SectionVariant;
  id?: string;
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

const variantStyles: Record<SectionVariant, string> = {
  light: "bg-light-bg text-light-text",
  dark: "bg-dark-bg text-dark-text",
};

export function Section({
  variant = "light",
  id,
  children,
  className = "",
  "data-testid": testId,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`py-16 md:py-24 ${variantStyles[variant]} ${className}`}
      data-testid={testId}
    >
      <div className="container mx-auto px-4 md:px-6">{children}</div>
    </section>
  );
}
