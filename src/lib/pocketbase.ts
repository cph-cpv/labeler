import PocketBase from "pocketbase";

// Create PocketBase client instance
export const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || "http://localhost:8080",
);
