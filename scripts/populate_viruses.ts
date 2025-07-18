import { parse } from "csv-parse/sync";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import Pocketbase from "pocketbase";

dotenv.config({ path: ".env.local" });

const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || "password123";

export async function populate_viruses(pb: Pocketbase, path: string) {
  const data = parse(await fs.readFile(path, "utf8"));

  for (const virus of data) {
    const record = await pb.collection("viruses").create({
      uuid: virus[0],
      acronym: virus[1],
      name: virus[2],
    });

    console.log(`Created record: ${record.id} for virus '${virus[2]}'`);
  }
}

async function main() {
  const client = new Pocketbase(
    process.env.VITE_POCKETBASE_URL || "http://localhost:8080",
  );
  await client
    .collection("_superusers")
    .authWithPassword(adminEmail, adminPassword);
  await populate_viruses(client, "input/viruses.csv");
}

main().catch(console.error);
