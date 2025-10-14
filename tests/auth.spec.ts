import { expect, test } from "@playwright/test";
import { TEST_CREDENTIALS } from "./constants";

test.describe("Authentication", () => {
  test("shows authenticated content when logged in", async ({ page }) => {
    await page.goto("/");

    // Should see authenticated app content (navigation) since we're pre-authenticated
    await expect(page.getByRole("link", { name: "FASTQs" })).toBeVisible();

    // Should not see login form since we're already authenticated
    await expect(page.locator('input[type="email"]')).not.toBeVisible();
  });

  test.describe("Unauthenticated", () => {
    // Reset storage state for this group to test login flow
    test.use({ storageState: { cookies: [], origins: [] } });

    test("shows login form and allows successful login", async ({ page }) => {
      await page.goto("/");

      // Should show login form when unauthenticated
      await expect(page.locator('input[type="email"]')).toBeVisible();

      // Fill in login form
      await page
        .locator('input[type="email"]')
        .fill(TEST_CREDENTIALS.USER_EMAIL);
      await page
        .locator('input[type="password"]')
        .fill(TEST_CREDENTIALS.USER_PASSWORD);

      // Submit form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Check for authentication failure first
      const authFailedLocator = page.getByText("Authentication failed");
      const emailInputLocator = page.locator('input[type="email"]');

      // Race between authentication failure and successful login
      const result = await Promise.race([
        authFailedLocator
          .waitFor({ state: "visible", timeout: 10000 })
          .then(() => "failed"),
        emailInputLocator
          .waitFor({ state: "hidden", timeout: 10000 })
          .then(() => "success"),
      ]);

      if (result === "failed") {
        throw new Error("Authentication failed - test should not continue");
      }

      // Should see authenticated app content (navigation)
      await expect(page.getByRole("link", { name: "FASTQs" })).toBeVisible();
    });
  });
});
