import { expect, test as setup } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to the login page
  await page.goto("/");

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

  // Wait a bit more to ensure PocketBase auth store is properly updated
  await page.waitForTimeout(1000);

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});
