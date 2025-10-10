import { createAuthenticatedClient } from "./client";
import { enableBatch } from "./enable-batch";
import { populateExternalFastqs } from "./populate-external-fastqs.ts";
import { populateFastqs } from "./populate-fastqs";
import { populateViruses } from "./populate-viruses";
import { resetCollections } from "./reset-collections";

async function reset() {
  const pb = await createAuthenticatedClient("http://localhost:8080");

  console.log("📋 Resetting collections...");
  await resetCollections(pb);
  console.log("✅ Finished resetting collections.");

  await enableBatch(pb);
  console.log("✅ Batch operations enabled");

  console.log("🦠 Populating viruses...");
  const virusCount = await populateViruses(pb, "input/viruses.csv");
  console.log(`✅ Created ${virusCount} virus records`);

  console.log("📁 Populating FASTQs...");
  const fastqCount = await populateFastqs(pb, "input/files.txt");
  const externalFastqCount = await populateExternalFastqs(
    pb,
    "input/external_files.txt",
  );
  console.log(`✅ Created ${fastqCount + externalFastqCount} FASTQ records`);

  console.log("✅ Reset complete!");
}

reset().catch(console.error);
