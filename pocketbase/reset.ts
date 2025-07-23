import { createAuthenticatedClient } from "./client";
import { enableBatch } from "./enable-batch";
import { populateFiles } from "./populate-files";
import { populateViruses } from "./populate-viruses";
import { resetCollections } from "./reset-collections";

async function reset() {
  const pb = await createAuthenticatedClient();

  console.log("📋 Resetting collections...");
  await resetCollections(pb);
  console.log("✅ Finished resetting collections.");

  await enableBatch(pb);

  console.log("🦠 Populating viruses...");
  const virusCount = await populateViruses(pb, "input/viruses.csv");
  console.log(`✅ Created ${virusCount} virus records`);

  console.log("📁 Populating FASTQs...");
  const fastqCount = await populateFiles(pb, "input/files.txt");
  console.log(`✅ Created ${fastqCount} FASTQ records`);

  console.log("✅ Reset complete!");
}

reset().catch(console.error);
