import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("homepage loads with correct title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Time Tracker/);
  });

  test("homepage displays heading and tagline", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Time Tracker" })).toBeVisible();
    await expect(page.getByText("Simple time tracking for freelancers")).toBeVisible();
  });
});
