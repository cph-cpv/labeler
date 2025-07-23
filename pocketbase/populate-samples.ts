import type PocketBase from "pocketbase";

export async function populateSamples(pb: PocketBase) {
  const sampleData = [
    { name: "Sample A", description: "Test sample A" },
    { name: "Sample B", description: "Test sample B" },
    { name: "Sample C", description: "Test sample C" },
    { name: "Sample D", description: "Test sample D" },
    { name: "Sample E", description: "Test sample E" },
  ];

  for (const sample of sampleData) {
    await pb.collection("samples").create(sample);
  }

  console.log(`✅ Populated ${sampleData.length} samples`);
}
