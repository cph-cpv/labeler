import { expect, test } from "@playwright/test";

test.describe("Viruses Page", () => {
  test("viruses table contains rows", async ({ page }) => {
    await page.goto("/viruses");

    // Wait for the table to load
    await page.waitForSelector("table");

    // Check that the table has rows (beyond just the header)
    const tableRows = page.locator("table tbody tr");
    await expect(tableRows).not.toHaveCount(0);
  });
});
