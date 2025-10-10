import type { TypedPocketBase } from "@/lib/typed-pocketbase.ts";
import { expect, test as setup } from "@playwright/test";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { createAuthenticatedClient } from "../pocketbase/client";
import { enableBatch } from "../pocketbase/enable-batch";
import { populateFastqs } from "../pocketbase/populate-fastqs";
import { populateViruses } from "../pocketbase/populate-viruses";
import { resetCollections } from "../pocketbase/reset-collections";
import { TEST_CREDENTIALS } from "./constants";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

const DOCKER_COMPOSE_BASE =
  "docker compose -p labeler-test -f docker-compose.test.yml ";

setup.describe.configure({ mode: "serial" });

setup.describe("Test Environment Setup", () => {
  setup("setup database", async () => {
    process.env.POCKETBASE_PORT = "8081";
    console.log("⚡ Cleaning up existing test containers...");
    try {
      await execAsync(`${DOCKER_COMPOSE_BASE} down -v --remove-orphans`);
    } catch (error) {
      // Ignore errors if containers don't exist
      console.log("ℹ No existing containers to clean up");
    }

    console.log("⚡ Starting test Pocketbase instance...");
    await execAsync(`${DOCKER_COMPOSE_BASE} up -d`);

    console.log("⚡ Waiting for Pocketbase to be ready...");

    const startTime = Date.now();
    const maxWaitTime = 10000; // 10 seconds
    let attempt = 0;
    let pb: TypedPocketBase | undefined;

    while (Date.now() - startTime < maxWaitTime) {
      attempt++;
      try {
        pb = await createAuthenticatedClient("http://localhost:8081");
        console.log("✔ Pocketbase is ready for connections");
        break;
      } catch (error) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `ℹ Attempt ${attempt} failed after ${elapsed}s, retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (pb == undefined) {
      throw new Error(
        "Pocketbase authentication timed out after 10s. Is it running and configured correctly?",
      );
    }

    console.log("⚡ Enabling batch operations...");
    await enableBatch(pb);
    console.log("✔ Batch operations enabled");

    console.log("⚡ Creating test user...");
    try {
      await pb.collection("users").create({
        email: TEST_CREDENTIALS.USER_EMAIL,
        password: TEST_CREDENTIALS.USER_PASSWORD,
        passwordConfirm: TEST_CREDENTIALS.USER_PASSWORD,
      });
      console.log("✔ Test user created");
    } catch (error: any) {
      console.log("❗ Error creating test user:", error);
      console.log("ℹ Error details:", JSON.stringify(error.response, null, 2));

      try {
        const existingUser = await pb
          .collection("users")
          .getFirstListItem(`email = "${TEST_CREDENTIALS.USER_EMAIL}"`);
        console.log("ℹ Test user already exists:", existingUser.email);
      } catch (fetchError) {
        console.log(
          "❗ User doesn't exist and couldn't be created:",
          fetchError,
        );
        throw error;
      }
    }

    console.log("↻ Resetting collections...");
    await resetCollections(pb);
    console.log("✔ Collections reset");

    console.log("⚡ Populating viruses collection...");
    const virusCount = await populateViruses(pb, "input/test_viruses.csv");
    console.log(`✔ Populated ${virusCount} viruses`);

    console.log("⚡ Populating fastqs collection...");
    const fastqCount = await populateFastqs(pb, "input/test_files.txt");
    console.log(`✔ Populated ${fastqCount} fastqs`);
  });

  setup("authenticate", async ({ page }) => {
    // Navigate to the login page
    await page.goto("/");

    // Fill in login form
    await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.USER_EMAIL);
    await page
      .locator('input[type="password"]')
      .fill(TEST_CREDENTIALS.USER_PASSWORD);

    // Submit form
    await page.getByRole("button", { name: /sign in/i }).click();

    // Wait for login to complete - should see authenticated content
    // The login form should disappear and app content should appear
    await expect(page.locator('input[type="email"]')).not.toBeVisible();

    // Should see authenticated app content (navigation)
    await expect(page.getByRole("link", { name: "FASTQs" })).toBeVisible();

    // Wait a bit more to ensure PocketBase auth store is properly updated
    await page.waitForTimeout(1000);

    // Save the authenticated state
    await page.context().storageState({ path: authFile });
  });
});
