import { test } from "@playwright/test";

test.describe("Debug Viruses Page", () => {
  test("check what renders on viruses page", async ({ page }) => {
    await page.goto("http://localhost:3000/viruses");

    // Wait a bit for any loading
    await page.waitForTimeout(2000);

    // Take a screenshot to see what's on the page
    await page.screenshot({ path: "viruses-debug.png", fullPage: true });

    // Check for various elements
    console.log("Page title:", await page.title());
    console.log("Page URL:", page.url());

    // Check for the main heading
    const heading = page.getByRole("heading", { name: "Viruses" });
    console.log("Heading exists:", await heading.isVisible());

    // Check for tabs
    const tabs = page.getByRole("tablist");
    console.log("Tabs exist:", await tabs.isVisible());

    // Check for tab content
    const tabContent = page.locator('[data-state="active"]');
    console.log("Active tab content exists:", await tabContent.count());

    // Check for any table
    const table = page.getByRole("table");
    console.log("Table exists:", await table.count());

    // Check for loading indicator
    const loading = page.getByText("Loading");
    console.log("Loading indicator exists:", await loading.isVisible());

    // Check for error messages
    const error = page.getByText(/error/i);
    console.log("Error message exists:", await error.count());

    // Get page content for debugging
    const content = await page.content();
    console.log(
      "Page content includes 'Viruses':",
      content.includes("Viruses"),
    );
    console.log("Page content includes 'table':", content.includes("table"));

    // Check browser console for any errors
    const messages = await page.evaluate(() => {
      return window.console;
    });
  });
});
