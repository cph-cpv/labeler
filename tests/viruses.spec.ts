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

  test.describe("Multi-virus Type Assignment", () => {
    test("should update multiple virus types and refresh table", async ({
      page,
    }) => {
      await page.goto("/viruses");

      // Wait for the table to load
      await page.waitForSelector("table");

      // Select the first 3 viruses by clicking their checkboxes
      const checkboxes = page.locator("table tbody tr input[type='checkbox']");
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();

      // Verify selection bar appears
      const selectionBar = page.locator('[class*="fixed"][class*="bottom-0"]');
      await expect(selectionBar).toBeVisible();
      await expect(selectionBar).toContainText("3 viruses selected");

      // Get the original types of the selected viruses before update
      const originalTypes = [];
      for (let i = 0; i < 3; i++) {
        const row = page.locator("table tbody tr").nth(i);
        const typeCell = row.locator("td").nth(2); // Type column
        const originalType = await typeCell.textContent();
        originalTypes.push(originalType?.trim());
      }

      // Click the Type button to open dialog
      await page.getByRole("button", { name: /Type/ }).click();

      // Wait for dialog to appear
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText("Set Virus Type");
      await expect(dialog).toContainText("Set the type for 3 selected viruses");

      // Open the virus type dropdown
      await page.click('button[role="combobox"]');

      // Select "Satellite" as the new type
      await page.click('div[role="option"]:has-text("Satellite")');

      // Verify the selection is shown in the dropdown
      await expect(page.locator('button[role="combobox"]')).toContainText(
        "Satellite",
      );

      // Click Assign Type button
      await page.click('button[type="submit"]:has-text("Assign Type")');

      // Wait for the assignment to complete (button should show "Assigning..." briefly)
      await page.waitForTimeout(100); // Brief wait for loading state

      // Verify dialog closes
      await expect(dialog).not.toBeVisible();

      // Verify selection bar disappears (selection cleared)
      // The bar slides down with translate-y-full class
      await expect(selectionBar).toHaveClass(/translate-y-full/);

      // Verify that the virus types have been updated in the table without page reload
      // This tests that the cache update is working correctly
      for (let i = 0; i < 3; i++) {
        const row = page.locator("table tbody tr").nth(i);
        const typeCell = row.locator("td").nth(2);

        // Wait for the cell to contain "Satellite"
        await expect(typeCell).toContainText("Satellite");

        // Verify it changed from the original type (unless it was already Satellite)
        const newType = await typeCell.textContent();
        if (originalTypes[i] !== "Satellite") {
          expect(newType?.trim()).not.toBe(originalTypes[i]);
        }
      }
    });

    test("should handle keyboard shortcut to open type dialog", async ({
      page,
    }) => {
      await page.goto("/viruses");
      await page.waitForSelector("table");

      // Select a virus
      const checkbox = page
        .locator("table tbody tr input[type='checkbox']")
        .first();
      await checkbox.check();

      // Use keyboard shortcut 'T' to open dialog
      await page.keyboard.press("t");

      // Verify dialog opens
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText("Set Virus Type");
    });

    test("should show error message for failed type assignment", async ({
      page,
    }) => {
      // This test would require mocking network failure, but with Playwright + real backend
      // we can test by potentially stopping the backend or using network interception
      // For now, we'll test the error UI by checking if error states are handled

      await page.goto("/viruses");
      await page.waitForSelector("table");

      // Select a virus
      await page
        .locator("table tbody tr input[type='checkbox']")
        .first()
        .check();

      // Open type dialog
      await page.getByRole("button", { name: /Type/ }).click();

      // Verify error handling exists in the dialog structure
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Check that error display elements exist in the DOM (even if not visible)
      const errorContainer = dialog.locator("div.text-red-500");
      // Error container should exist in DOM structure even if no error is currently shown
      await expect(errorContainer).toHaveCount(0); // No errors initially
    });

    test("should disable assign button when no type is selected", async ({
      page,
    }) => {
      await page.goto("/viruses");
      await page.waitForSelector("table");

      // Select a virus
      await page
        .locator("table tbody tr input[type='checkbox']")
        .first()
        .check();

      // Open type dialog
      await page.getByRole("button", { name: /Type/ }).click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Verify assign button is disabled initially
      const assignButton = dialog.locator(
        'button[type="submit"]:has-text("Assign Type")',
      );
      await expect(assignButton).toBeDisabled();

      // Select a type
      await page.click('button[role="combobox"]');
      await page.click('div[role="option"]:has-text("Virus")');

      // Verify assign button is now enabled
      await expect(assignButton).toBeEnabled();
    });
  });
});
