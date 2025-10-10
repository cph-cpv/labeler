import { expect, test, type Locator } from "@playwright/test";

test.describe("FASTQs Page", () => {
  let rows: Locator;
  let table: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto("/fastqs");
    table = page.getByTestId("fastqs-table");
    await table.waitFor();
    rows = table.locator("tbody tr");
    await expect(rows).not.toHaveCount(0);
  });

  test("click-based multi selection and deselection", async ({ page }) => {
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
    // 1. Click #1 - #1 is checked
    const checkbox1 = rows.nth(0).locator("input[type='checkbox']");
    await checkbox1.click();
    await expect(checkbox1).toBeChecked();
    await expect(page.locator("text=1 FASTQ selected")).toBeVisible();

    // 2. Hold shift, click #8 - #1-#8 are checked
    const checkbox8 = rows.nth(7).locator("input[type='checkbox']");
    await checkbox8.click({ modifiers: ["Shift"] });
    await expect(page.locator("text=8 FASTQs selected")).toBeVisible();
    for (let i = 0; i < 8; i++) {
      await expect(rows.nth(i).locator("input[type='checkbox']")).toBeChecked();
    }

    // 3. Click #10 (shift still held) - #1-#10 are checked
    const checkbox10 = rows.nth(9).locator("input[type='checkbox']");
    await checkbox10.click({ modifiers: ["Shift"] });
    await expect(page.locator("text=10 FASTQs selected")).toBeVisible();
    for (let i = 0; i < 10; i++) {
      await expect(rows.nth(i).locator("input[type='checkbox']")).toBeChecked();
    }

    // 4. Click #5 (shift still held) - #1-#4 are checked, #5 is NOT checked
    const checkbox5 = rows.nth(4).locator("input[type='checkbox']");
    await checkbox5.click({ modifiers: ["Shift"] });
    await expect(page.locator("text=4 FASTQs selected")).toBeVisible();
    for (let i = 0; i < 4; i++) {
      await expect(rows.nth(i).locator("input[type='checkbox']")).toBeChecked();
    }
    await expect(checkbox5).not.toBeChecked();
    for (let i = 5; i < 10; i++) {
      await expect(
        rows.nth(i).locator("input[type='checkbox']"),
      ).not.toBeChecked();
    }

    // 5. Click #1 (shift still held) - Nothing is checked
    await checkbox1.click({ modifiers: ["Shift"] });
    await expect(page.locator("text=0 FASTQs selected")).toBeVisible();
    for (let i = 0; i < 10; i++) {
      await expect(
        rows.nth(i).locator("input[type='checkbox']"),
      ).not.toBeChecked();
    }
  });

  test("Search functionality with URL parameters", async ({ page }) => {
    // Find the search input
    const searchInput = page.getByPlaceholder("Search");
    await expect(searchInput).toBeVisible();

    // Start empty - verify >5 items match 14G4 pattern
    const cellsWithPattern14G4 = rows.locator("td").getByText(/^14G4/);
    const countOf14G4 = await cellsWithPattern14G4.count();
    expect(countOf14G4).toBeGreaterThan(5);

    // Type search term "SP"
    await searchInput.fill("SP");

    // Verify URL contains search parameter
    await expect(page).toHaveURL(/search=SP/);

    // Wait for table to update and verify 0 items match 14G4, but >5 match 14SP
    await expect(cellsWithPattern14G4).toHaveCount(0);

    const cellsWithPattern14SP = rows.locator("td").getByText(/14SP/);
    const countOf14SP = await cellsWithPattern14SP.count();
    expect(countOf14SP).toBeGreaterThan(5);

    // Clear search and verify URL parameter is removed
    await searchInput.clear();
    await expect(page).not.toHaveURL(/search=/);

    // Navigate away and back to verify search persists
    await page.goto("/fastqs?search=sample");
    await expect(searchInput).toHaveValue("sample");
    await expect(page).toHaveURL(/search=sample/);
  });

  test.describe("Multi-FASTQ Assignment", () => {
    // Reuse setup from parent beforeEach
    test("should assign multiple FASTQs to a sample and refresh table", async ({
      page,
    }) => {
      // Select the first 3 FASTQs by clicking their checkboxes
      const checkboxes = rows.locator("input[type='checkbox']");
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();

      // Verify selection bar appears
      const selectionBar = page.locator('[class*="fixed"][class*="bottom-0"]');
      await expect(selectionBar).toBeVisible();
      await expect(selectionBar).toContainText("3 FASTQs selected");

      // Click the Assign button to open dialog
      await page.getByRole("button", { name: /Sample/ }).click();

      // Wait for dialog to appear
      const dialog = page.getByRole("dialog", { name: "Assign Sample" });
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("heading", { name: "Assign Sample" }),
      ).toBeVisible();
      await expect(
        dialog.getByText("Assign a sample to all selected FASTQ files."),
      ).toBeVisible();

      await dialog
        .getByRole("textbox", { name: "Type to search samples..." })
        .type("test");

      // Select the first available sample
      const firstOption = page.locator('div[role="option"]').first();
      await firstOption.click();

      // Verify the selection is shown in the dropdown
      const selectedSampleText = await firstOption.textContent();
      await expect(page.getByRole("cell", { name: "3" })).toBeVisible();
    });

    test("should handle keyboard shortcut to open assign dialog", async ({
      page,
    }) => {
      // Select a FASTQ
      const checkbox = rows.locator("input[type='checkbox']").first();
      await checkbox.check();

      // Use keyboard shortcut 'S' to open dialog
      await page.keyboard.press("s");

      // Verify dialog opens
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText("Assign Sample");
    });

    test("should show correct count in dialog for single vs multiple FASTQs", async ({
      page,
    }) => {
      // Test single FASTQ
      await rows.locator("input[type='checkbox']").first().check();

      await page.getByRole("button", { name: /Sample/ }).click();

      let dialog = page.locator('[role="dialog"]');
      await expect(page.getByRole("cell", { name: "1" })).toBeVisible();

      // Close dialog
      await page.keyboard.press("Escape");

      // Test multiple FASTQs
      const checkboxes = rows.locator("input[type='checkbox']");
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();

      await page.getByRole("button", { name: /Sample/ }).click();

      dialog = page.locator('[role="dialog"]');
      await expect(page.getByRole("cell", { name: "3" })).toBeVisible();
    });
  });

  test.describe("Multi-FASTQ Dilution", () => {
    test("should select two FASTQs, click Dilution button, and set dilution to 1:20", async ({
      page,
    }) => {
      // Select the first two FASTQs by clicking their checkboxes
      const checkboxes = rows.locator("input[type='checkbox']");
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();

      // Click the Dilution button to open dialog
      await page.getByRole("button", { name: /Dilution/ }).click();

      // Wait for dialog to appear
      const dialog = page.getByRole("dialog", { name: "Dilution Factor" });
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText("Dilution Factor");
      await expect(dialog).toContainText(
        "Set the dilution factor for all selected FASTQ files",
      );

      // Open the dilution dropdown within the dialog
      await dialog.locator('button[role="combobox"]').click();

      // Select the 1:20 dilution option within the dialog
      const dilutionOption = page.getByRole("option", {
        name: "1:20",
        exact: true,
      });
      await dilutionOption.click();

      // Verify the selection is shown in the dropdown within the dialog
      await expect(dialog.locator('button[role="combobox"]')).toContainText(
        "1:20",
      );
    });

    test("should handle keyboard shortcut 'D' to open dilution dialog", async ({
      page,
    }) => {
      // Select a FASTQ
      const checkbox = rows.locator("input[type='checkbox']").first();
      await checkbox.check();

      // Use keyboard shortcut 'D' to open dialog
      await page.keyboard.press("d");

      // Verify dialog opens
      const dialog = page.getByRole("dialog", { name: "Dilution Factor" });
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText("Dilution Factor");
    });
  });
});
