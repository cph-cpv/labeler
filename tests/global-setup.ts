import { exec } from "child_process";
import PocketBase from "pocketbase";
import { promisify } from "util";
import { enableBatch } from "../pocketbase/enable-batch";
import { populateFiles } from "../pocketbase/populate-files";
import { populateViruses } from "../pocketbase/populate-viruses";
import { resetCollections } from "../pocketbase/reset-collections";

const execAsync = promisify(exec);

async function globalSetup() {
  process.env.VITE_POCKETBASE_URL = "http://localhost:8081";

  await execAsync("docker compose -f docker-compose.test.yml up -d");

  console.log("Waiting for init container to complete...");
  await execAsync(
    "docker compose -f docker-compose.test.yml wait pocketbase-test-init",
  );

  console.log("Waiting for Pocketbase to be ready...");

  const pb = new PocketBase("http://localhost:8081");

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await pb
        .collection("_superusers")
        .authWithPassword("test@example.com", "testpass123");
      console.log("Authenticated with Pocketbase");
      break;
    } catch (error) {
      if (attempt === 5) {
        throw new Error(
          "Pocketbase authentication timed out. Is it running and configured correctly?",
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  await enableBatch(pb);
  console.log("Enabled batch requests");

  try {
    await pb.collection("users").create({
      email: "test@example.com",
      password: "testpassword123",
      passwordConfirm: "testpassword123",
    });
    console.log("Created test user");
  } catch (error) {
    console.log("Error creating test user:", error);
    // User might already exist, try to fetch it
    try {
      const existingUser = await pb
        .collection("users")
        .getFirstListItem('email = "test@example.com"');
      console.log("Test user already exists:", existingUser.email);
    } catch (fetchError) {
      console.log("User doesn't exist and couldn't be created:", fetchError);
      throw error;
    }
  }

  await resetCollections(pb);
  await populateViruses(pb, "input/viruses.csv");
  await populateFiles(pb, "input/files.txt");
}

export default globalSetup;
