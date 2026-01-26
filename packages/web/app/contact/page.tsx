"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {};
    const name = formData.get("name")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const message = formData.get("message")?.toString().trim() || "";

    if (!name) {
      newErrors.name = "Name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!message) {
      newErrors.message = "Message is required";
    } else if (message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      return;
    }

    setFormState("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
          website: formData.get("website"), // honeypot
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setFormState("success");
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  if (formState === "success") {
    return (
      <main className="min-h-screen bg-light-bg text-light-text">
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24 max-w-xl">
          <div
            className="bg-green-50 border border-green-200 rounded-lg p-8 text-center"
            data-testid="success-message"
          >
            <svg
              className="w-16 h-16 text-green-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Message Sent!
            </h2>
            <p className="text-green-700 mb-6">
              Thank you for contacting us. We&apos;ll get back to you soon.
            </p>
            <Link
              href="/"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-light-bg text-light-text">
      <div className="container mx-auto px-4 py-16 md:px-6 md:py-24 max-w-xl">
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
          data-testid="contact-title"
        >
          Contact Us
        </h1>

        <p className="text-muted mb-8">
          Have a question or feedback? We&apos;d love to hear from you. Fill out the
          form below and we&apos;ll get back to you as soon as possible.
        </p>

        {formState === "error" && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700"
            data-testid="error-message"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="contact-form" noValidate>
          {/* Honeypot field - hidden from users, visible to bots */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              data-testid="honeypot-field"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="Your name"
              data-testid="name-input"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500" data-testid="name-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="your@email.com"
              data-testid="email-input"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500" data-testid="email-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.message ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none`}
              placeholder="Your message..."
              data-testid="message-input"
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500" data-testid="message-error">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formState === "submitting"}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="submit-button"
          >
            {formState === "submitting" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </main>
  );
}
