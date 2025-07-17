import PocketBase from "pocketbase";

// Create PocketBase client instance
export const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || "http://localhost:8080",
);

// Auto-refresh auth state
pb.authStore.onChange(() => {
  console.log(
    "Auth state changed:",
    pb.authStore.isValid ? "authenticated" : "unauthenticated",
  );
});
