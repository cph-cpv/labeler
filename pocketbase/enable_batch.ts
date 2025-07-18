import Pocketbase from "pocketbase";
import { createAuthenticatedClient } from "./client";
import { isMainModule } from "./utils";

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

if (isMainModule()) {
  await enableBatch(await createAuthenticatedClient());
}
