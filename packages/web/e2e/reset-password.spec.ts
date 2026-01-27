import { test, expect } from "@playwright/test";

test.describe("Reset Password Page - Invalid Link", () => {
  test("shows error state when no token provided", async ({ page }) => {
    await page.goto("/reset-password");

    // Should show error state for missing token
    await expect(page.getByTestId("error-state")).toBeVisible();
    await expect(page.getByText("Reset Link Invalid")).toBeVisible();
    await expect(page.getByText("Invalid or missing reset link")).toBeVisible();
  });

  test("shows error state when type is not recovery", async ({ page }) => {
    await page.goto("/reset-password?token_hash=abc123&type=signup");

    await expect(page.getByTestId("error-state")).toBeVisible();
    await expect(page.getByText("Invalid or missing reset link")).toBeVisible();
  });

  test("shows error state when only token_hash is provided", async ({ page }) => {
    await page.goto("/reset-password?token_hash=abc123");

    await expect(page.getByTestId("error-state")).toBeVisible();
    await expect(page.getByText("Invalid or missing reset link")).toBeVisible();
  });

  test("error state has back to home link", async ({ page }) => {
    await page.goto("/reset-password");

    await expect(page.getByTestId("error-state")).toBeVisible();
    const backLink = page.getByRole("link", { name: "Back to Home" });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });

  test("can navigate home from error state", async ({ page }) => {
    await page.goto("/reset-password");

    await expect(page.getByTestId("error-state")).toBeVisible();
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Reset Password Page - Verifying State", () => {
  test("shows verifying state initially with valid params", async ({ page }) => {
    // Mock the Supabase call to hang so we can see the verifying state
    await page.route("**/auth/v1/verify*", async (route) => {
      // Delay response to keep verifying state visible
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await route.fulfill({
        status: 400,
        json: { error: "invalid_token", error_description: "Token has expired" },
      });
    });

    await page.goto("/reset-password?token_hash=test123&type=recovery");

    // Should show verifying state
    await expect(page.getByTestId("verifying-state")).toBeVisible();
    await expect(page.getByText("Verifying your reset link...")).toBeVisible();
  });
});

test.describe("Reset Password Page - Form Display", () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful token verification
    await page.route("**/auth/v1/verify*", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: "test-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "test-refresh",
          user: { id: "test-user-id", email: "test@example.com" },
        },
      });
    });
  });

  test("displays password form after successful verification", async ({ page }) => {
    await page.goto("/reset-password?token_hash=valid-token&type=recovery");

    // Wait for form to appear
    await expect(page.getByTestId("reset-password-form")).toBeVisible();
    await expect(page.getByTestId("reset-password-title")).toHaveText("Reset Your Password");
  });

  test("displays all form fields", async ({ page }) => {
    await page.goto("/reset-password?token_hash=valid-token&type=recovery");

    await expect(page.getByTestId("reset-password-form")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("confirm-password-input")).toBeVisible();
    await expect(page.getByTestId("submit-button")).toBeVisible();
  });

  test("has back to home link", async ({ page }) => {
    await page.goto("/reset-password?token_hash=valid-token&type=recovery");

    await expect(page.getByTestId("reset-password-form")).toBeVisible();
    const backLink = page.getByTestId("back-to-home");
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });

  test("navigates back to home", async ({ page }) => {
    await page.goto("/reset-password?token_hash=valid-token&type=recovery");

    await expect(page.getByTestId("reset-password-form")).toBeVisible();
    await page.getByTestId("back-to-home").click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Reset Password Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful token verification
    await page.route("**/auth/v1/verify*", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: "test-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "test-refresh",
          user: { id: "test-user-id", email: "test@example.com" },
        },
      });
    });

    await page.goto("/reset-password?token_hash=valid-token&type=recovery");
    await expect(page.getByTestId("reset-password-form")).toBeVisible();
  });

  test("shows error when password is empty", async ({ page }) => {
    await page.getByTestId("confirm-password-input").fill("password123");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("password-error")).toBeVisible();
    await expect(page.getByTestId("password-error")).toHaveText("Password is required");
  });

  test("shows error when password is too short", async ({ page }) => {
    await page.getByTestId("password-input").fill("12345");
    await page.getByTestId("confirm-password-input").fill("12345");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("password-error")).toBeVisible();
    await expect(page.getByTestId("password-error")).toHaveText(
      "Password must be at least 6 characters"
    );
  });

  test("shows error when confirm password is empty", async ({ page }) => {
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("confirm-password-error")).toBeVisible();
    await expect(page.getByTestId("confirm-password-error")).toHaveText(
      "Please confirm your password"
    );
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("confirm-password-input").fill("password456");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("confirm-password-error")).toBeVisible();
    await expect(page.getByTestId("confirm-password-error")).toHaveText("Passwords do not match");
  });

  test("shows multiple errors at once", async ({ page }) => {
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("password-error")).toBeVisible();
    await expect(page.getByTestId("confirm-password-error")).toBeVisible();
  });
});

test.describe("Reset Password Form Submission", () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful token verification
    await page.route("**/auth/v1/verify*", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: "test-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "test-refresh",
          user: { id: "test-user-id", email: "test@example.com" },
        },
      });
    });

    await page.goto("/reset-password?token_hash=valid-token&type=recovery");
    await expect(page.getByTestId("reset-password-form")).toBeVisible();
  });

  test("shows success message after valid submission", async ({ page }) => {
    // Mock successful password update
    await page.route("**/auth/v1/user", async (route) => {
      await route.fulfill({
        status: 200,
        json: { id: "test-user-id", email: "test@example.com" },
      });
    });

    await page.getByTestId("password-input").fill("newpassword123");
    await page.getByTestId("confirm-password-input").fill("newpassword123");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("success-message")).toBeVisible();
    await expect(page.getByText("Password Updated!")).toBeVisible();
    await expect(
      page.getByText("Your password has been successfully changed")
    ).toBeVisible();
  });

  test("submit button shows loading state during submission", async ({ page }) => {
    // Mock password update with delay
    await page.route("**/auth/v1/user", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        json: { id: "test-user-id", email: "test@example.com" },
      });
    });

    await page.getByTestId("password-input").fill("newpassword123");
    await page.getByTestId("confirm-password-input").fill("newpassword123");

    const submitButton = page.getByTestId("submit-button");
    await submitButton.click();

    // Check for loading state
    await expect(submitButton).toHaveText("Updating...");

    // Wait for success message
    await expect(page.getByTestId("success-message")).toBeVisible();
  });

  test("can navigate home after successful submission", async ({ page }) => {
    // Mock successful password update
    await page.route("**/auth/v1/user", async (route) => {
      await route.fulfill({
        status: 200,
        json: { id: "test-user-id", email: "test@example.com" },
      });
    });

    await page.getByTestId("password-input").fill("newpassword123");
    await page.getByTestId("confirm-password-input").fill("newpassword123");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("success-message")).toBeVisible();
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("shows error message when password update fails", async ({ page }) => {
    // Mock failed password update
    await page.route("**/auth/v1/user", async (route) => {
      await route.fulfill({
        status: 422,
        json: { error: "weak_password", message: "Password is too weak" },
      });
    });

    await page.getByTestId("password-input").fill("newpassword123");
    await page.getByTestId("confirm-password-input").fill("newpassword123");
    await page.getByTestId("submit-button").click();

    // Should show error message but stay on form
    await expect(page.getByTestId("error-message")).toBeVisible();
    await expect(page.getByTestId("reset-password-form")).toBeVisible();
  });
});

test.describe("Reset Password - Token Verification Failure", () => {
  test("shows error when token is expired", async ({ page }) => {
    // Mock expired token response
    await page.route("**/auth/v1/verify*", async (route) => {
      await route.fulfill({
        status: 400,
        json: {
          error: "invalid_token",
          error_description: "Token has expired or is invalid",
        },
      });
    });

    await page.goto("/reset-password?token_hash=expired-token&type=recovery");

    await expect(page.getByTestId("error-state")).toBeVisible();
    await expect(page.getByText("This reset link has expired or is invalid")).toBeVisible();
  });
});

test.describe("Reset Password - Hash Fragment Flow (PKCE)", () => {
  // Note: Full PKCE flow tests require valid JWT tokens which can't be easily mocked.
  // The hash fragment parsing logic is tested here, and full E2E is done manually.

  test("shows error when hash type is not recovery", async ({ page }) => {
    await page.goto("/reset-password#access_token=test-token&refresh_token=test-refresh&type=signup&expires_in=3600");

    await expect(page.getByTestId("error-state")).toBeVisible();
    await expect(page.getByText("Invalid or missing reset link")).toBeVisible();
  });

  test("shows error when hash fragment has invalid tokens", async ({ page }) => {
    // Invalid tokens will fail setSession validation
    await page.goto("/reset-password#access_token=invalid&refresh_token=invalid&type=recovery&expires_in=3600");

    await expect(page.getByTestId("error-state")).toBeVisible();
    await expect(page.getByText("expired or is invalid")).toBeVisible();
  });
});
