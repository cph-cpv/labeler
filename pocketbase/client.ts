import * as dotenv from "dotenv";
import Pocketbase from "pocketbase";

dotenv.config({ path: ".env.local" });

export async function createAuthenticatedClient(url?: string) {
  const pbUrl =
    url || process.env.VITE_POCKETBASE_URL || "http://localhost:8080";
  const pb = new Pocketbase(pbUrl);
  await pb
    .collection("_superusers")
    .authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL || "admin@example.com",
      process.env.POCKETBASE_ADMIN_PASSWORD || "password123",
    );
  return pb;
}
