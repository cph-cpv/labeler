import * as fs from "fs/promises";
import * as path from "path";
import Pocketbase from "pocketbase";

export async function populateFastqs(pb: Pocketbase, filePath: string) {
  const input = await fs.readFile(filePath, "utf8");
  const files = input.split("\n").filter((line) => line.length > 0);

  const batchSize = 100;
  let totalCreated = 0;

  for (let i = 0; i < files.length; i += batchSize) {
    const batchFiles = files.slice(i, i + batchSize);
    const batch = pb.createBatch();

    for (const file of batchFiles) {
      const fileName = path.basename(file, ".fastq.gz");
      const date = extractDateFromFilePath(file);

      batch.collection("fastqs").create({
        path: file,
        name: fileName,
        date: date,
        extraction: determineExtractionTypeFromDate(date),
        library_prep: determinePrepTypeFromDate(date),
      });
    }

    const result = await batch.send();
    totalCreated += result.length;
  }

  return totalCreated;
}

function determinePrepTypeFromDate(date: string) {
  const exceptions = [
    new Date("2024-06-07").getTime(),
    new Date("2025-02-21").getTime(),
  ];
  const creationTime = new Date(date).getTime();

  const roboticThreshold = new Date("2024-01-10").getTime();
  const manualThreshold = new Date("2022-04-08").getTime();

  if (creationTime > roboticThreshold && !exceptions.includes(creationTime)) {
    return "robotic";
  }

  if (creationTime < manualThreshold) {
    return "manual";
  }

  return null;
}

function determineExtractionTypeFromDate(date: string) {
  return new Date(date).getTime() < new Date("2023-11-28").getTime()
    ? "manual"
    : null;
}

function extractDateFromFilePath(filePath: string) {
  const dateString = filePath.match(
    /^\/mnt\/raw\/illumina\/(?:nextseq_[15]000?\/)?(\d{6}).*$/,
  )?.[1];
  if (!dateString) throw new Error(`Could not extract date from: ${filePath}`);
  const year = "20" + dateString.substring(0, 2);
  const month = dateString.substring(2, 4);
  const day = dateString.substring(4, 6);
  return `${year}-${month}-${day}`;
}
