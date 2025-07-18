import { expect, test } from "@playwright/test";

// Skip the auth setup by configuring this test to not use storageState
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Simple Virus Test", () => {
  test("can login and see viruses table", async ({ page }) => {
    // Go directly to the app
    await page.goto("http://localhost:3001/");

    // Login
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.locator('input[type="password"]').fill("testpassword123");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Wait a moment for the response
    await page.waitForTimeout(2000);

    // Check what happened after login
    const emailStillVisible = await page
      .locator('input[type="email"]')
      .isVisible();
    const navigationVisible = await page.getByRole("navigation").isVisible();
    const errorVisible = await page
      .getByText(/error|failed|invalid/i)
      .isVisible();

    console.log("After login attempt:");
    console.log("- Email input still visible:", emailStillVisible);
    console.log("- Navigation visible:", navigationVisible);
    console.log("- Error visible:", errorVisible);

    if (errorVisible) {
      const errorText = await page
        .getByText(/error|failed|invalid/i)
        .textContent();
      console.log("- Error text:", errorText);
    }

    // Wait for login to succeed - check for navigation
    await expect(page.getByRole("navigation")).toBeVisible();

    // Navigate to viruses page
    await page.goto("http://localhost:3001/viruses");

    // Wait for the page to load
    await expect(page.getByRole("heading", { name: "Viruses" })).toBeVisible();

    // Check if table appears
    await expect(page.getByRole("table")).toBeVisible();

    console.log("✓ Successfully authenticated and accessed viruses table");
  });
});
