import { test as teardown } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

teardown("cleanup database", async () => {
  console.log("Stopping test Pocketbase instance...");

  try {
    await execAsync(
      "docker compose -f docker-compose.test.yml down -v --remove-orphans",
    );
    console.log("Test Pocketbase stopped and volumes cleaned up");
  } catch (error) {
    console.error("Failed to stop test Pocketbase:", error);
  }
});
