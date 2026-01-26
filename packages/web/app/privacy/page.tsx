import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Time Tracker",
  description: "Privacy policy for the Time Tracker app",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-light-bg text-light-text">
      <div className="container mx-auto px-4 py-16 md:px-6 md:py-24 max-w-3xl">
        <Link
          href="/"
          className="text-primary hover:underline inline-flex items-center gap-1 mb-8"
          data-testid="back-to-home"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </Link>

        <h1
          className="text-4xl font-bold tracking-tight mb-4"
          data-testid="privacy-title"
        >
          Privacy Policy
        </h1>

        <p className="text-muted mb-8" data-testid="last-updated">
          Last updated: January 26, 2025
        </p>

        <div className="prose prose-gray max-w-none" data-testid="privacy-content">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4 text-muted">
              Time Tracker (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, and safeguard
              your information when you use our mobile application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-4 text-muted">We collect the following types of information:</p>
            <ul className="list-disc pl-6 mb-4 text-muted space-y-2">
              <li>
                <strong>Account Information:</strong> Email address and password (encrypted)
                when you create an account
              </li>
              <li>
                <strong>Time Entries:</strong> Time tracking data including start time, end
                time, duration, and descriptions
              </li>
              <li>
                <strong>Client and Project Data:</strong> Names and details of clients and
                projects you create
              </li>
              <li>
                <strong>Device Information:</strong> Basic device identifiers for
                authentication and sync purposes
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Store Your Data</h2>
            <p className="mb-4 text-muted">
              Your data is securely stored using Supabase, a trusted cloud database
              provider. Supabase uses industry-standard encryption and security practices
              to protect your information. Data is stored in data centers with
              enterprise-grade security measures.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="mb-4 text-muted">We use the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4 text-muted space-y-2">
              <li>
                <strong>Supabase:</strong> For authentication and data storage. Their
                privacy policy can be found at{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  supabase.com/privacy
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4 text-muted">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-muted space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate data
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and associated
                data
              </li>
              <li>
                <strong>Export:</strong> Export your time tracking data
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="mb-4 text-muted">
              We retain your data for as long as your account is active. If you delete
              your account, your data will be permanently deleted within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4 text-muted">
              If you have questions about this Privacy Policy or want to exercise your
              rights, please{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="mb-4 text-muted">
              We may update this Privacy Policy from time to time. We will notify you of
              any changes by updating the &quot;Last updated&quot; date at the top of this page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
