import { test, expect } from "@playwright/test";

test.describe("Navigation Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("App Store Badge Links", () => {
    test("hero App Store badge has href", async ({ page }) => {
      const badge = page.getByTestId("app-store-badge");

      await expect(badge).toHaveAttribute("href", "#");
    });

    test("CTA App Store badge has href", async ({ page }) => {
      const badge = page.getByTestId("cta-app-store");

      await expect(badge).toHaveAttribute("href", "#");
    });
  });

  test.describe("Footer Links", () => {
    test("privacy link has correct href", async ({ page }) => {
      const link = page.getByTestId("footer-privacy-link");

      await expect(link).toHaveAttribute("href", "/privacy");
      await expect(link).toHaveText("Privacy Policy");
    });

    test("terms link has correct href", async ({ page }) => {
      const link = page.getByTestId("footer-terms-link");

      await expect(link).toHaveAttribute("href", "/terms");
      await expect(link).toHaveText("Terms");
    });

    test("contact link is visible in footer", async ({ page }) => {
      const link = page.getByTestId("footer-contact-link");

      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", "/contact");
      await expect(link).toHaveText("Contact");
    });
  });

  test.describe("CTA Contact Link", () => {
    test("contact link is visible", async ({ page }) => {
      const link = page.getByTestId("cta-contact");

      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", "/contact");
    });
  });
});
