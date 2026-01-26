import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("displays contact page title", async ({ page }) => {
    const title = page.getByTestId("contact-title");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("Contact Us");
  });

  test("displays contact form with all fields", async ({ page }) => {
    const form = page.getByTestId("contact-form");
    await expect(form).toBeVisible();

    await expect(page.getByTestId("name-input")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("message-input")).toBeVisible();
    await expect(page.getByTestId("submit-button")).toBeVisible();
  });

  test("has back to home link", async ({ page }) => {
    const backLink = page.getByTestId("back-to-home");
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });

  test("navigates back to home", async ({ page }) => {
    await page.getByTestId("back-to-home").click();
    await expect(page).toHaveURL("/");
  });

  test("honeypot field exists but is hidden", async ({ page }) => {
    const honeypot = page.getByTestId("honeypot-field");
    // Field should exist in DOM but not be visible
    await expect(honeypot).toBeAttached();
    await expect(honeypot).toBeHidden();
  });
});

test.describe("Contact Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("shows error when name is empty", async ({ page }) => {
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("message-input").fill("This is a test message");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("name-error")).toBeVisible();
    await expect(page.getByTestId("name-error")).toHaveText("Name is required");
  });

  test("shows error when email is empty", async ({ page }) => {
    await page.getByTestId("name-input").fill("John Doe");
    await page.getByTestId("message-input").fill("This is a test message");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("email-error")).toBeVisible();
    await expect(page.getByTestId("email-error")).toHaveText("Email is required");
  });

  test("shows error when email is invalid", async ({ page }) => {
    await page.getByTestId("name-input").fill("John Doe");
    await page.getByTestId("email-input").fill("invalid-email");
    await page.getByTestId("message-input").fill("This is a test message");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("email-error")).toBeVisible();
    await expect(page.getByTestId("email-error")).toHaveText(
      "Please enter a valid email address"
    );
  });

  test("shows error when message is empty", async ({ page }) => {
    await page.getByTestId("name-input").fill("John Doe");
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("message-error")).toBeVisible();
    await expect(page.getByTestId("message-error")).toHaveText("Message is required");
  });

  test("shows error when message is too short", async ({ page }) => {
    await page.getByTestId("name-input").fill("John Doe");
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("message-input").fill("Short");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("message-error")).toBeVisible();
    await expect(page.getByTestId("message-error")).toHaveText(
      "Message must be at least 10 characters"
    );
  });

  test("shows multiple errors at once", async ({ page }) => {
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("name-error")).toBeVisible();
    await expect(page.getByTestId("email-error")).toBeVisible();
    await expect(page.getByTestId("message-error")).toBeVisible();
  });
});

test.describe("Contact Form Submission", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("shows success message after valid submission", async ({ page }) => {
    await page.getByTestId("name-input").fill("John Doe");
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("message-input").fill("This is a test message for the contact form.");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("success-message")).toBeVisible();
    await expect(page.getByText("Message Sent!")).toBeVisible();
    await expect(page.getByText("Thank you for contacting us")).toBeVisible();
  });

  test("submit button shows loading state during submission", async ({ page }) => {
    // Intercept API call and delay response to observe loading state
    await page.route("/api/contact", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({ json: { success: true } });
    });

    await page.getByTestId("name-input").fill("John Doe");
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("message-input").fill("This is a test message for the contact form.");

    // Click submit and check loading state appears
    const submitButton = page.getByTestId("submit-button");
    await submitButton.click();

    // Check for loading state
    await expect(submitButton).toHaveText("Sending...");

    // Wait for success message
    await expect(page.getByTestId("success-message")).toBeVisible();
  });

  test("can navigate home after successful submission", async ({ page }) => {
    await page.getByTestId("name-input").fill("John Doe");
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("message-input").fill("This is a test message for the contact form.");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("success-message")).toBeVisible();
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Contact Page Navigation from Home", () => {
  test("footer contact link navigates to contact page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("footer-contact-link").click();
    await expect(page).toHaveURL("/contact");
    await expect(page.getByTestId("contact-title")).toBeVisible();
  });

  test("CTA contact link navigates to contact page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("cta-contact").click();
    await expect(page).toHaveURL("/contact");
    await expect(page.getByTestId("contact-title")).toBeVisible();
  });
});
