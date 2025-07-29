import Pocketbase from "pocketbase";

export async function enableBatch(pb: Pocketbase) {
  console.log("⚡ Enabling batch operations...");

  // Get current settings
  const settings = await pb.settings.getAll();

  // Update settings
  await pb.settings.update({
    ...settings,
    batch: {
      enabled: true,
      maxRequests: 100,
      timeout: 30,
      maxBodySize: 0,
    },
  });

  console.log("✅ Batch operations enabled");
}
