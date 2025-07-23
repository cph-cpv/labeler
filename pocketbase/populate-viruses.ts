import { parse } from "csv-parse/sync";
import * as fs from "fs/promises";
import Pocketbase from "pocketbase";

export async function populateViruses(pb: Pocketbase, path: string) {
  const data = parse(await fs.readFile(path, "utf8"));

  const batchSize = 100;
  let totalCreated = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batchData = data.slice(i, i + batchSize);
    const batch = pb.createBatch();

    for (const virus of batchData) {
      batch.collection("viruses").create({
        acronym: virus[1],
        name: virus[2],
        uuid: virus[0],
      });
    }

    const result = await batch.send();
    totalCreated += result.length;
  }

  return totalCreated;
}
