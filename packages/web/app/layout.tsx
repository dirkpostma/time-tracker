import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Time Tracker - Simple Time Tracking for Freelancers",
  description:
    "Track your time with one tap. Manage clients, projects, and time entries. Beautiful themes, offline support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
