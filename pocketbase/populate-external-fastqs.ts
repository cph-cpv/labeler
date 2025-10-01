import * as fs from "fs/promises";
import * as path from "path";
import Pocketbase from "pocketbase";

export async function populateExternalFastqs(pb: Pocketbase, filePath: string) {
  const input = await fs.readFile(filePath, "utf8");
  const lines = input.split("\n").filter((line) => line.length > 0);

  const batchSize = 100;
  let totalCreated = 0;

  for (let i = 0; i < lines.length; i += batchSize) {
    const batchLines = lines.slice(i, i + batchSize);
    const batch = pb.createBatch();

    for (const filePath of batchLines) {
      const fileName = getBaseName(filePath);
      const yearString = extractYearFromFilePath(filePath);

      batch.collection("fastqs").create({
        path: filePath,
        name: fileName,
        date: `${yearString}-01-01`,
        library_prep: "external",
        extraction: "external"
      });
    }

    const result = await batch.send();
    totalCreated += result.length;
  }

  return totalCreated;
}

function getBaseName(filePath: string) {
  let baseName = path.basename(filePath);
  const extensions = [".fq.gz", ".fastq.gz", ".fp.fq.gz"];

  for (const ext of extensions) {
    if (baseName.endsWith(ext)) {
      return path.basename(baseName, ext);
    }
  }

  return baseName;
}

function extractYearFromFilePath(filePath: string) {
  if (!filePath.startsWith("/mnt/raw/rott/grdi")){
    return "15"
  }

  const yearString = filePath.match(
    /^\/mnt\/raw\/rott\/grdi\/13C\/?(\d{2}).*$/,
  )?.[1];
  if (!yearString) throw new Error(`Could not extract date from: ${filePath}`);
  return yearString
}