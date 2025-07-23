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
});
