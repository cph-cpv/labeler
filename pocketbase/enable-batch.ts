import Pocketbase from "pocketbase";

export async function enableBatch(pb: Pocketbase) {
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
}
