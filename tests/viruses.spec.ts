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

  test.describe("search functionality", () => {
    test("should filter by acronym TMV", async ({ page }) => {
      await page.goto("/viruses");

      // Wait for table to load
      await page.waitForSelector("table tbody tr");

      // Count total rows before search
      const initialRows = await page.locator("table tbody tr").count();

      // Type TMV in search input
      await page.fill("input[placeholder='Search viruses...']", "TMV");

      // Wait for results to update
      await page.waitForFunction(() => {
        const url = window.location.href;
        return url.includes("search=TMV");
      });

      // Verify URL contains search parameter
      await expect(page).toHaveURL(/search=TMV/);

      // Verify filtered results contain TMV
      const filteredRows = page.locator("table tbody tr");
      const filteredCount = await filteredRows.count();
      expect(filteredCount).toBeGreaterThan(0);

      // Assert that "Tobacco mosaic virus" is one of the returned rows
      await expect(page.locator("table tbody tr").filter({ hasText: "Tobacco mosaic virus" })).toHaveCount(1);

      // Check that all visible rows contain TMV in either name or acronym
      const rowCount = await filteredRows.count();
      for (let i = 0; i < rowCount; i++) {
        const row = filteredRows.nth(i);
        const nameCell = row.locator("td").nth(0);
        const acronymCell = row.locator("td").nth(1);

        const nameText = await nameCell.textContent();
        const acronymText = await acronymCell.textContent();

        expect(
          (nameText && nameText.toLowerCase().includes("tmv")) ||
            (acronymText && acronymText.toLowerCase().includes("tmv")),
        ).toBe(true);
      }

      // Verify we have fewer rows than initial (search is filtering)
      expect(rowCount).toBeLessThan(initialRows);
    });

    test("should filter by partial name tobacco mosaic v", async ({ page }) => {
      await page.goto("/viruses");

      // Wait for table to load
      await page.waitForSelector("table tbody tr");

      // Type partial name in search input
      await page.fill(
        "input[placeholder='Search viruses...']",
        "tobacco mosaic v",
      );

      // Wait for results to update
      await page.waitForFunction(() => {
        const url = window.location.href;
        return url.includes("search=tobacco+mosaic+v");
      });

      // Verify URL contains encoded search parameter
      await expect(page).toHaveURL(/search=tobacco\+mosaic\+v/);

      // Verify filtered results
      const filteredRows = page.locator("table tbody tr");
      const filteredCount = await filteredRows.count();
      expect(filteredCount).toBeGreaterThan(0);

      // Check that results contain tobacco mosaic virus variants
      const rowCount = await filteredRows.count();
      for (let i = 0; i < rowCount; i++) {
        const row = filteredRows.nth(i);
        const nameCell = row.locator("td").nth(0);
        const acronymCell = row.locator("td").nth(1);

        const nameText = await nameCell.textContent();
        const acronymText = await acronymCell.textContent();

        expect(
          (nameText && nameText.toLowerCase().includes("tobacco mosaic")) ||
            (acronymText &&
              acronymText.toLowerCase().includes("tobacco mosaic")),
        ).toBe(true);
      }
    });

    test("should preserve search in url parameters", async ({ page }) => {
      // Navigate directly to URL with search parameter
      await page.goto("/viruses?search=TMV");

      // Wait for page to load
      await page.waitForSelector("table tbody tr");

      // Verify search input is pre-populated
      await expect(
        page.locator("input[placeholder='Search viruses...']"),
      ).toHaveValue("TMV");

      // Verify filtered results are displayed immediately
      const filteredRows = page.locator("table tbody tr");
      const filteredCount = await filteredRows.count();
      expect(filteredCount).toBeGreaterThan(0);

      // Navigate away and back
      await page.goto("/");
      await page.goBack();

      // Verify search is still preserved
      await expect(
        page.locator("input[placeholder='Search viruses...']"),
      ).toHaveValue("TMV");
      await expect(page).toHaveURL(/search=TMV/);
    });

    test("should clear search and show all results", async ({ page }) => {
      await page.goto("/viruses");

      // Wait for table to load and get initial count
      await page.waitForSelector("table tbody tr");
      const initialRowCount = await page.locator("table tbody tr").count();

      // Apply search filter
      await page.fill("input[placeholder='Search viruses...']", "TMV");
      await page.waitForFunction(() =>
        window.location.href.includes("search=TMV"),
      );

      // Wait for table to re-render with filtered results
      await page.waitForFunction((initialCount) => {
        const currentRows = document.querySelectorAll("table tbody tr");
        return currentRows.length !== initialCount;
      }, initialRowCount);

      // Verify search is active
      const filteredRowCount = await page.locator("table tbody tr").count();
      expect(filteredRowCount).toBeLessThan(initialRowCount);

      // Clear search
      await page.fill("input[placeholder='Search viruses...']", "");

      // Wait for URL to update (search parameter should be removed)
      await page.waitForFunction(
        () => !window.location.search.includes("search="),
      );

      // Verify all results are shown again
      const clearedRowCount = await page.locator("table tbody tr").count();
      expect(clearedRowCount).toBe(initialRowCount);

      // Verify URL no longer contains search parameter
      await expect(page).not.toHaveURL(/search=/);
    });

    test("should reset pagination when searching", async ({ page }) => {
      await page.goto("/viruses");

      // Wait for table and pagination to load
      await page.waitForSelector("table tbody tr");

      // Check if pagination exists (only if there are multiple pages)
      const paginationNext = page.locator("a[aria-label='Go to next page']");
      const hasMultiplePages = await paginationNext.isVisible();

      if (hasMultiplePages) {
        // Go to page 2
        await paginationNext.click();
        await page.waitForFunction(() =>
          window.location.href.includes("page=2"),
        );
        await expect(page).toHaveURL(/page=2/);

        // Apply search
        await page.fill("input[placeholder='Search viruses...']", "TMV");
        await page.waitForFunction(() =>
          window.location.href.includes("search=TMV"),
        );

        // Verify page resets to 1 (URL should not contain page=2)
        await expect(page).not.toHaveURL(/page=2/);
        await expect(page).toHaveURL(/search=TMV/);

        // Verify we're on page 1 by checking if "previous" button is disabled
        const paginationPrev = page.locator(
          "a[aria-label='Go to previous page']",
        );
        if (await paginationPrev.isVisible()) {
          await expect(paginationPrev).toHaveClass(/opacity-50/);
        }
      } else {
        // If no pagination, just test that search works normally
        await page.fill("input[placeholder='Search viruses...']", "TMV");
        await page.waitForFunction(() =>
          window.location.href.includes("search=TMV"),
        );
        await expect(page).toHaveURL(/search=TMV/);
      }
    });
  });
});
