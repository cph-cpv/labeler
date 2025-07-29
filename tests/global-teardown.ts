import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function globalTeardown() {
  console.log("Stopping test Pocketbase instance...");

  try {
    await execAsync("docker compose -f docker-compose.test.yml down -v");
    console.log("Test Pocketbase stopped and volumes cleaned up");
  } catch (error) {
    console.error("Failed to stop test Pocketbase:", error);
  }
}

export default globalTeardown;
