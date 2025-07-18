import { expect, test } from "@playwright/test";

test.describe("Virus Type Assignment", () => {
  test("select 10 viruses and change type to Virus", async ({ page }) => {
    await page.goto("http://localhost:3001/viruses");

    await expect(page.getByRole("table")).toBeVisible();

    // Click on the "Untyped" tab to see viruses without types
    await page.getByRole("tab", { name: /untyped/i }).click();

    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(25, { timeout: 10000 });

    for (let i = 0; i < 10; i++) {
      await checkboxes.nth(i).check();
    }

    await expect(page.getByText("10 selected")).toBeVisible();

    await page.keyboard.press("t");

    await expect(page.getByRole("dialog")).toBeVisible();

    const typeDropdown = page.getByRole("combobox");
    await typeDropdown.click();
    await page.getByRole("option", { name: "Virus" }).click();

    await page.getByRole("button", { name: /assign/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();

    await expect(page.getByText("0 selected")).toBeVisible();
  });
});
