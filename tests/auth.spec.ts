import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test("shows authenticated content when logged in", async ({ page }) => {
    await page.goto("/");

    // Should see authenticated app content (navigation) since we're pre-authenticated
    await expect(page.getByRole("navigation")).toBeVisible();

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
      await page.locator('input[type="email"]').fill("test@example.com");
      await page.locator('input[type="password"]').fill("testpassword123");

      // Submit form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Wait for login to complete - should see authenticated content
      // The login form should disappear and app content should appear
      await expect(page.locator('input[type="email"]')).not.toBeVisible();

      // Should see authenticated app content (navigation)
      await expect(page.getByRole("navigation")).toBeVisible();
    });
  });
});
