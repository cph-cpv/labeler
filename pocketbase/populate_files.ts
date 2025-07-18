import * as fs from "fs/promises";
import * as path from "path";
import Pocketbase from "pocketbase";
import { createAuthenticatedClient } from "./client";
import { isMainModule } from "./utils";

export async function populate_files(pb: Pocketbase, file_path: string) {
  const input = await fs.readFile(file_path, "utf8");
  const files = input.split("\n").filter((line) => line.length > 0);

  for (const filePath of files) {
    const fileName = path.basename(filePath, ".fastq.gz");
    const date = extractDateFromFilePath(filePath);
    const record = await pb.collection("files").create({
      path: filePath,
      name: fileName,
      date: date,
    });

    console.log("Created record:", record.id, "for file:", fileName);
  }
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

if (isMainModule()) {
  await populate_files(
    await createAuthenticatedClient(),
    "input_data/files.txt",
  );
}
