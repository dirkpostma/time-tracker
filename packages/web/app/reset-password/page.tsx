"use client";

import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";

type PageState = "verifying" | "ready" | "submitting" | "success" | "error";

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const verifyToken = async () => {
      let supabase;
      try {
        supabase = getSupabase();
      } catch (error) {
        console.error("Supabase initialization error:", error);
        setErrorMessage("Service temporarily unavailable. Please try again later.");
        setPageState("error");
        return;
      }

      // Check for hash fragment (PKCE flow) - Supabase redirects with #access_token=...&type=recovery
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");

      if (accessToken && refreshToken && hashType === "recovery") {
        // Session is already established via hash fragment, set it in Supabase client
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setErrorMessage("This reset link has expired or is invalid");
            setPageState("error");
            return;
          }

          setPageState("ready");
          return;
        } catch {
          setErrorMessage("Failed to verify reset link");
          setPageState("error");
          return;
        }
      }

      // Check for query params (token_hash flow) - ?token_hash=...&type=recovery
      const queryParams = new URLSearchParams(window.location.search);
      const tokenHash = queryParams.get("token_hash");
      const queryType = queryParams.get("type");

      if (tokenHash && queryType === "recovery") {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (error) {
            setErrorMessage("This reset link has expired or is invalid");
            setPageState("error");
            return;
          }

          setPageState("ready");
          return;
        } catch {
          setErrorMessage("Failed to verify reset link");
          setPageState("error");
          return;
        }
      }

      // No valid token found
      setErrorMessage("Invalid or missing reset link");
      setPageState("error");
    };

    verifyToken();
  }, []);

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {};
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    setPageState("submitting");

    try {
      const supabase = getSupabase();
      const password = formData.get("password")?.toString() || "";
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw new Error(error.message);
      }

      setPageState("success");
    } catch (error) {
      setPageState("ready");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update password"
      );
    }
  };

  if (pageState === "verifying") {
    return (
      <main className="min-h-screen bg-light-bg text-light-text">
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24 max-w-xl">
          <div className="text-center" data-testid="verifying-state">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted">Verifying your reset link...</p>
          </div>
        </div>
      </main>
    );
  }

  if (pageState === "success") {
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
              Password Updated!
            </h2>
            <p className="text-green-700 mb-6">
              Your password has been successfully changed. You can now sign in
              with your new password in the mobile app.
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

  if (pageState === "error" && !errors.password && !errors.confirmPassword) {
    return (
      <main className="min-h-screen bg-light-bg text-light-text">
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24 max-w-xl">
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-8 text-center"
            data-testid="error-state"
          >
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Reset Link Invalid
            </h2>
            <p className="text-red-700 mb-6">{errorMessage}</p>
            <p className="text-muted mb-6">
              Please request a new password reset link from the mobile app.
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
          data-testid="reset-password-title"
        >
          Reset Your Password
        </h1>

        <p className="text-muted mb-8">
          Enter your new password below. Make sure it&apos;s at least 6 characters
          long.
        </p>

        {errorMessage && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700"
            data-testid="error-message"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="reset-password-form" noValidate>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="Enter new password"
              data-testid="password-input"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500" data-testid="password-error">
                {errors.password}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="Confirm new password"
              data-testid="confirm-password-input"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500" data-testid="confirm-password-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pageState === "submitting"}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="submit-button"
          >
            {pageState === "submitting" ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
