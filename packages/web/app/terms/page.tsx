import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Time Tracker",
  description: "Terms of service for the Time Tracker app",
};

export default function TermsPage() {
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
          data-testid="terms-title"
        >
          Terms of Service
        </h1>

        <p className="text-muted mb-8" data-testid="last-updated">
          Last updated: January 26, 2025
        </p>

        <div className="prose prose-gray max-w-none" data-testid="terms-content">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="mb-4 text-muted">
              By downloading, installing, or using Time Tracker (&quot;the App&quot;), you
              agree to be bound by these Terms of Service. If you do not agree to these
              terms, do not use the App.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p className="mb-4 text-muted">
              Time Tracker is a mobile application that allows users to track time spent
              on various tasks, organize work by clients and projects, and view time
              entry history. The App may be updated from time to time with new features
              or changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
            <p className="mb-4 text-muted">As a user of the App, you agree to:</p>
            <ul className="list-disc pl-6 mb-4 text-muted space-y-2">
              <li>Provide accurate information when creating an account</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Use the App only for lawful purposes</li>
              <li>Not attempt to access other users&apos; data or accounts</li>
              <li>Not interfere with or disrupt the App&apos;s functionality</li>
              <li>Not reverse engineer, decompile, or disassemble the App</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p className="mb-4 text-muted">
              The App and its original content, features, and functionality are owned by
              Time Tracker and are protected by international copyright, trademark, and
              other intellectual property laws. You may not copy, modify, distribute, or
              create derivative works based on the App without our express written
              permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">User Data</h2>
            <p className="mb-4 text-muted">
              You retain all rights to the data you enter into the App. By using the
              App, you grant us a limited license to store and process your data solely
              for the purpose of providing the service. Please refer to our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              for details on how we handle your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="mb-4 text-muted">
              To the maximum extent permitted by law, Time Tracker shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of profits, data, or other intangible
              losses, resulting from:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted space-y-2">
              <li>Your use or inability to use the App</li>
              <li>Any unauthorized access to your data</li>
              <li>Any interruption or cessation of the service</li>
              <li>Any bugs, viruses, or errors in the App</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p className="mb-4 text-muted">
              The App is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any
              kind, either express or implied, including but not limited to implied
              warranties of merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="mb-4 text-muted">
              We reserve the right to terminate or suspend your account and access to
              the App at our sole discretion, without notice, for conduct that we
              believe violates these Terms of Service or is harmful to other users, us,
              or third parties, or for any other reason. You may terminate your account
              at any time by deleting your account through the App settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p className="mb-4 text-muted">
              These Terms of Service shall be governed by and construed in accordance
              with the laws of the United States, without regard to its conflict of law
              provisions. Any disputes arising from these terms shall be resolved in the
              courts of competent jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="mb-4 text-muted">
              We reserve the right to modify these Terms of Service at any time. We will
              notify you of any changes by updating the &quot;Last updated&quot; date at the top
              of this page. Your continued use of the App after any changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4 text-muted">
              If you have questions about these Terms of Service, please{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
