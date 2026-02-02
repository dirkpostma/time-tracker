import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Hero Section", () => {
    test("displays title and tagline", async ({ page }) => {
      const title = page.getByTestId("hero-title");
      const tagline = page.getByTestId("hero-tagline");

      await expect(title).toBeVisible();
      await expect(title).toContainText("Track time");
      await expect(title).toContainText("Get paid");
      await expect(tagline).toBeVisible();
      await expect(tagline).toContainText("time tracker");
    });

    test("displays App Store badge", async ({ page }) => {
      const badge = page.getByTestId("app-store-badge");

      await expect(badge).toBeVisible();
    });

    test("displays hero screenshot", async ({ page }) => {
      const screenshot = page.getByTestId("hero-screenshot");

      await expect(screenshot).toBeVisible();
    });
  });

  test.describe("Features Section", () => {
    test("displays 4 feature cards", async ({ page }) => {
      const section = page.getByTestId("features-section");
      const cards = page.getByTestId("feature-card");

      await expect(section).toBeVisible();
      await expect(cards).toHaveCount(4);
    });

    test("displays feature titles", async ({ page }) => {
      const featuresSection = page.getByTestId("features-section");
      await expect(
        featuresSection.getByRole("heading", { name: "One-Tap Tracking" })
      ).toBeVisible();
      await expect(
        featuresSection.getByRole("heading", { name: "Clients & Projects" })
      ).toBeVisible();
      await expect(
        featuresSection.getByRole("heading", { name: "History & Reports" })
      ).toBeVisible();
      await expect(
        featuresSection.getByRole("heading", { name: "Offline Support" })
      ).toBeVisible();
    });
  });

  test.describe("Screenshots Section", () => {
    test("displays screenshots section", async ({ page }) => {
      const section = page.getByTestId("screenshots-section");

      await expect(section).toBeVisible();
    });

    test("displays screenshot images", async ({ page }) => {
      const images = page.getByTestId("screenshot-image");

      // Desktop: 3 phones + 1 settings + mobile scroll (4) = 8 minimum
      const count = await images.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test("displays app logo in screenshots section", async ({ page }) => {
      const logo = page.getByTestId("screenshots-logo");
      await expect(logo).toBeVisible();
    });
  });

  test.describe("CTA Section", () => {
    test("displays CTA section with content", async ({ page }) => {
      const section = page.getByTestId("cta-section");
      const appStoreButton = page.getByTestId("cta-app-store");
      const contactLink = page.getByTestId("cta-contact");

      await expect(section).toBeVisible();
      await expect(appStoreButton).toBeVisible();
      await expect(contactLink).toBeVisible();
    });

    test("displays CTA heading", async ({ page }) => {
      const section = page.getByTestId("cta-section");
      await expect(
        section.getByRole("heading", { name: /Ready to take control/ })
      ).toBeVisible();
    });
  });

  test.describe("Footer", () => {
    test("displays footer with links", async ({ page }) => {
      const footer = page.getByTestId("footer");
      const privacyLink = page.getByTestId("footer-privacy-link");
      const termsLink = page.getByTestId("footer-terms-link");
      const copyright = page.getByTestId("footer-copyright");

      await expect(footer).toBeVisible();
      await expect(privacyLink).toBeVisible();
      await expect(termsLink).toBeVisible();
      await expect(copyright).toBeVisible();
    });

    test("displays correct copyright text", async ({ page }) => {
      const copyright = page.getByTestId("footer-copyright");

      await expect(copyright).toContainText("2025 Time Tracker");
      await expect(copyright).toContainText("All rights reserved");
    });
  });
});

test.describe("Responsive Design", () => {
  test("renders correctly on mobile (390x844)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByTestId("hero-title")).toBeVisible();
    await expect(page.getByTestId("features-section")).toBeVisible();
    await expect(page.getByTestId("screenshots-section")).toBeVisible();
    await expect(page.getByTestId("cta-section")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();

    // Check no horizontal overflow
    const body = page.locator("body");
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(390);
  });

  test("renders correctly on tablet (768x1024)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(page.getByTestId("hero-title")).toBeVisible();
    await expect(page.getByTestId("features-section")).toBeVisible();
    await expect(page.getByTestId("screenshots-section")).toBeVisible();
    await expect(page.getByTestId("cta-section")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
  });

  test("renders correctly on desktop (1280x720)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await expect(page.getByTestId("hero-title")).toBeVisible();
    await expect(page.getByTestId("features-section")).toBeVisible();
    await expect(page.getByTestId("screenshots-section")).toBeVisible();
    await expect(page.getByTestId("cta-section")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
  });
});
