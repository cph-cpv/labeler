import { expect, test } from "@playwright/test";

test.describe("FASTQs Page", () => {
  test("click-based multi selection and deselection", async ({ page }) => {
    await page.goto("/fastqs");

    // Wait for the table to load
    await page.waitForSelector("table");

    // Get the first few rows
    const rows = page.locator("table tbody tr");
    await expect(rows).not.toHaveCount(0);

    // Select first FASTQ with click
    const firstCheckbox = rows.nth(0).locator("input[type='checkbox']");
    await firstCheckbox.click();

    // Verify selection panel appears with 1 selected
    const selectionPanel = page.locator("text=1 FASTQ selected");
    await expect(selectionPanel).toBeVisible();

    // Select second FASTQ with Ctrl+click (multi-select)
    const secondCheckbox = rows.nth(1).locator("input[type='checkbox']");
    await secondCheckbox.click({ modifiers: ["Control"] });

    // Verify 2 FASTQs selected
    await expect(page.locator("text=2 FASTQs selected")).toBeVisible();

    // Select third FASTQ with Ctrl+click
    const thirdCheckbox = rows.nth(2).locator("input[type='checkbox']");
    await thirdCheckbox.click({ modifiers: ["Control"] });

    // Verify 3 FASTQs selected
    await expect(page.locator("text=3 FASTQs selected")).toBeVisible();

    // Deselect second FASTQ by clicking its checkbox again
    await secondCheckbox.click();

    // Verify 2 FASTQs selected
    await expect(page.locator("text=2 FASTQs selected")).toBeVisible();

    // Verify first and third are still checked, second is not
    await expect(firstCheckbox).toBeChecked();
    await expect(secondCheckbox).not.toBeChecked();
    await expect(thirdCheckbox).toBeChecked();
  });

  test("shift-click based multi selection and deselection", async ({
    page,
  }) => {
    await page.goto("/fastqs");

    // Wait for the table to load
    await page.waitForSelector("table");
    const rows = page.locator("table tbody tr");
    await expect(rows).not.toHaveCount(0);

    // Select first FASTQ with click
    const firstCheckbox = rows.nth(0).locator("input[type='checkbox']");
    await firstCheckbox.click();

    // Verify 1 FASTQ selected
    await expect(page.locator("text=1 FASTQ selected")).toBeVisible();

    // Select range from first to fourth with Shift+click
    const fourthCheckbox = rows.nth(3).locator("input[type='checkbox']");
    await fourthCheckbox.click({ modifiers: ["Shift"] });

    // Verify 4 FASTQs selected (range selection)
    await expect(page.locator("text=4 FASTQs selected")).toBeVisible();

    // Verify all four checkboxes in range are checked
    await expect(rows.nth(0).locator("input[type='checkbox']")).toBeChecked();
    await expect(rows.nth(1).locator("input[type='checkbox']")).toBeChecked();
    await expect(rows.nth(2).locator("input[type='checkbox']")).toBeChecked();
    await expect(rows.nth(3).locator("input[type='checkbox']")).toBeChecked();

    // Shift+click on second checkbox should select range from first to second (rows 1-2)
    // This deselects rows 3-4 from the previous 1-4 selection
    const secondCheckbox = rows.nth(1).locator("input[type='checkbox']");
    await secondCheckbox.click({ modifiers: ["Shift"] });

    // After shift-clicking the second checkbox, should have only row 1 selected
    // (row 2 is deselected because it was the clicked item and was previously selected)
    await expect(rows.nth(0).locator("input[type='checkbox']")).toBeChecked();
    await expect(
      rows.nth(1).locator("input[type='checkbox']"),
    ).not.toBeChecked();
    await expect(
      rows.nth(2).locator("input[type='checkbox']"),
    ).not.toBeChecked();
    await expect(
      rows.nth(3).locator("input[type='checkbox']"),
    ).not.toBeChecked();

    // Count should be 1
    await expect(page.locator("text=1 FASTQ selected")).toBeVisible();
  });

  test.describe("Multi-FASTQ Assignment", () => {
    test("should assign multiple FASTQs to a sample and refresh table", async ({
      page,
    }) => {
      await page.goto("/fastqs");

      // Wait for the table to load
      await page.waitForSelector("table");

      // Select the first 3 FASTQs by clicking their checkboxes
      const checkboxes = page.locator("table tbody tr input[type='checkbox']");
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();

      // Verify selection bar appears
      const selectionBar = page.locator('[class*="fixed"][class*="bottom-0"]');
      await expect(selectionBar).toBeVisible();
      await expect(selectionBar).toContainText("3 FASTQs selected");

      // Click the Assign button to open dialog
      await page.getByRole("button", { name: /Assign/ }).click();

      // Wait for dialog to appear
      const dialog = page.getByRole("dialog", { name: "Assign FASTQs" });
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText("Assign FASTQs");
      await expect(dialog).toContainText("Assign a sample for the 3 selected");

      // Open the sample dropdown
      await page.click('button[role="combobox"]');

      // Select the first available sample
      const firstOption = page.locator('div[role="option"]').first();
      await firstOption.click();

      // Verify the selection is shown in the dropdown
      const selectedSampleText = await firstOption.textContent();
      await expect(page.locator('button[role="combobox"]')).toContainText(
        selectedSampleText || "",
      );

      // Verify assign button is enabled when sample is selected
      const assignButton = dialog.getByRole("button", {
        name: "Assign FASTQs",
      });
      await expect(assignButton).toBeEnabled();

      // Click the button to trigger assignment
      await assignButton.click();
    });

    test("should handle keyboard shortcut to open assign dialog", async ({
      page,
    }) => {
      await page.goto("/fastqs");
      await page.waitForSelector("table");

      // Select a FASTQ
      const checkbox = page
        .locator("table tbody tr input[type='checkbox']")
        .first();
      await checkbox.check();

      // Use keyboard shortcut 'S' to open dialog
      await page.keyboard.press("s");

      // Verify dialog opens
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText("Assign FASTQs");
    });

    test("should disable assign button when no sample is selected", async ({
      page,
    }) => {
      await page.goto("/fastqs");
      await page.waitForSelector("table");

      // Select a FASTQ
      await page
        .locator("table tbody tr input[type='checkbox']")
        .first()
        .check();

      // Open assign dialog
      await page.getByRole("button", { name: /Assign/ }).click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Verify assign button is disabled initially
      const assignButton = dialog.getByRole("button", {
        name: "Assign FASTQs",
      });
      await expect(assignButton).toBeDisabled();

      // Select a sample
      await page.click('button[role="combobox"]');
      await page.click('div[role="option"]');

      // Verify assign button is now enabled
      await expect(assignButton).toBeEnabled();
    });

    test("should show correct count in dialog for single vs multiple FASTQs", async ({
      page,
    }) => {
      await page.goto("/fastqs");
      await page.waitForSelector("table");

      // Test single FASTQ
      await page
        .locator("table tbody tr input[type='checkbox']")
        .first()
        .check();

      await page.getByRole("button", { name: /Assign/ }).click();

      let dialog = page.locator('[role="dialog"]');
      await expect(dialog).toContainText("Assign a sample for the 1 selected");

      // Close dialog
      await page.keyboard.press("Escape");

      // Test multiple FASTQs
      const checkboxes = page.locator("table tbody tr input[type='checkbox']");
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();

      await page.getByRole("button", { name: /Assign/ }).click();

      dialog = page.locator('[role="dialog"]');
      await expect(dialog).toContainText("Assign a sample for the 3 selected");
    });
  });
});
