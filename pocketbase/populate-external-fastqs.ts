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
  const extensions = [".fp.fastq.gz", ".fastq.gz", ".fq.gz"];

  for (const ext of extensions) {
    if (baseName.endsWith(ext)) {
      return path.basename(baseName, ext);
    }
  }

  return baseName;
}

function extractYearFromFilePath(filePath: string) {
  const patterns = [
    { prefix: "/mnt/raw/rott/grdi", regex: /^\/mnt\/raw\/rott\/grdi\/13C\/?(\d{2}).*$/ },
    { prefix: "/mnt/raw/rott/quads", regex: /^\/mnt\/raw\/rott\/quads\/.*_(\d{4}).*$/ },
  ];

  for (const pattern of patterns) {
    if (filePath.startsWith(pattern.prefix)) {
      const match = filePath.match(pattern.regex);
      if (match && match[1]) {
        const year = match[1];
        return year.length === 2 ? 20 + year : year;
      }
    }
  }

  return null;
}