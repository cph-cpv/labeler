import { parse } from "csv-parse/sync";
import * as fs from "fs/promises";
import * as path from "path";
import Pocketbase from "pocketbase";

const adminEmail = process.argv[2] || "admin@example.com";
const adminPassword = process.argv[3] || "password123";

export async function populate_viruses(pb: Pocketbase, file_path: string) {
  const input = await fs.readFile(file_path, "utf8");
  const data = parse(input);

  for (const virus of data) {
    console.log(virus);
    console.log({
      uuid: virus[0],
      acronym: virus[1],
      name: virus[2],
    });
    const record = await pb.collection("viruses").create({
      uuid: virus[0],
      acronym: virus[1],
      name: virus[2],
    });
    console.log("Created record:", record.id, "for file:", virus[2]);
  }
}

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

async function main() {
  const client = new Pocketbase("http://localhost:80");
  await client
    .collection("_superusers")
    .authWithPassword(adminEmail, adminPassword);
  await populate_files(client, "input_data/files.txt");
  await populate_viruses(client, "input_data/reference_info.csv");
}

main().catch(console.error);
