import { test, expect } from "@playwright/test";

test.describe("Privacy Policy Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/privacy");
  });

  test("displays privacy policy title", async ({ page }) => {
    const title = page.getByTestId("privacy-title");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("Privacy Policy");
  });

  test("displays last updated date", async ({ page }) => {
    const lastUpdated = page.getByTestId("last-updated");
    await expect(lastUpdated).toBeVisible();
    await expect(lastUpdated).toContainText("Last updated:");
  });

  test("displays privacy policy content", async ({ page }) => {
    const content = page.getByTestId("privacy-content");
    await expect(content).toBeVisible();

    // Check for key sections
    await expect(page.getByRole("heading", { name: "Introduction" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Information We Collect" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How We Store Your Data" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Third-Party Services" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your Rights" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contact Us" })).toBeVisible();
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

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Privacy Policy/);
  });
});

test.describe("Terms of Service Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/terms");
  });

  test("displays terms title", async ({ page }) => {
    const title = page.getByTestId("terms-title");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("Terms of Service");
  });

  test("displays last updated date", async ({ page }) => {
    const lastUpdated = page.getByTestId("last-updated");
    await expect(lastUpdated).toBeVisible();
    await expect(lastUpdated).toContainText("Last updated:");
  });

  test("displays terms content", async ({ page }) => {
    const content = page.getByTestId("terms-content");
    await expect(content).toBeVisible();

    // Check for key sections
    await expect(page.getByRole("heading", { name: "Acceptance of Terms" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "User Responsibilities" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Intellectual Property" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Limitation of Liability" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Termination" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Governing Law" })).toBeVisible();
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

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Terms of Service/);
  });
});

test.describe("Legal Pages Navigation from Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("footer privacy link navigates to privacy page", async ({ page }) => {
    await page.getByTestId("footer-privacy-link").click();
    await expect(page).toHaveURL("/privacy");
    await expect(page.getByTestId("privacy-title")).toBeVisible();
  });

  test("footer terms link navigates to terms page", async ({ page }) => {
    await page.getByTestId("footer-terms-link").click();
    await expect(page).toHaveURL("/terms");
    await expect(page.getByTestId("terms-title")).toBeVisible();
  });
});
