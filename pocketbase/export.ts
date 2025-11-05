import fs from "fs";
import papa from "papaparse";
import { createAuthenticatedClient } from "./client";

// --- TYPE DEFINITIONS ---
interface BaseRecord {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

interface VirusesResponse extends BaseRecord {
  name: string;
  uuid: string;
}

interface SamplesResponse extends BaseRecord {
  name: string;
  viruses: string[];
  expand?: {
    viruses?: VirusesResponse[];
  };
}

interface ExceptionsResponse extends BaseRecord {
  type: "Missing" | "Contamination";
  virus: string;
  expand?: {
    virus?: VirusesResponse;
  };
}

interface FilteredFastq extends BaseRecord {
  name: string;
  date: string;
  path: string;
  type: string;
  quality: string;
  dilution: string;
  extraction: string;
  library_prep: string;
  sample: string;
  expand: {
    sample: SamplesResponse & {
      expand: {
        viruses: VirusesResponse[];
      };
    };
    exceptions_via_fastq?: (ExceptionsResponse & {
      expand: {
        virus: VirusesResponse;
      };
    })[];
  };
}

async function getDuplicateFastqNames(fastqs: any[]) {
  const names = new Set<string>();
  const duplicates = new Set<string>();

  for (const fastq of fastqs) {
    const nameDateKey = fastq.name + fastq.date;
    if (names.has(nameDateKey)) {
      duplicates.add(nameDateKey);
    }
    names.add(nameDateKey);
  }

  return duplicates;
}

function formatFastqKey(fastq: FilteredFastq, virus: VirusesResponse) {
  return fastq.name + fastq.date + virus.uuid;
}

function formatFastqFileName(fastq: FilteredFastq) {
  return `${fastq.date.replace(/ \d+:\d+:\d+.\d+Z$/g, "")}${fastq.date ? "_" : ""}${fastq.name}.fastq.gz`;
}

function formatLabelerOutput(
  fastq: FilteredFastq,
  virus: VirusesResponse,
  annotation = "",
) {
  return {
    fastqName: fastq.name,
    type: fastq.type,
    quality: fastq.quality,
    dilution: fastq.dilution,
    extraction: fastq.extraction,
    libraryPrep: fastq.library_prep,
    sampleId: fastq.sample,
    virusId: virus.id,
    annotation,
    sampleName: fastq.expand.sample.name,
    virusUuid: virus.uuid,
  };
}

async function main() {
  const pb = await createAuthenticatedClient("http://127.0.0.1:8080");
  const fastqs = await pb.collection("fastqs").getFullList();

  const duplicateNames = await getDuplicateFastqNames(fastqs);

  const annotatedFastqs = (await pb.collection("fastqs").getFullList({
    expand: "sample,sample.viruses,exceptions_via_fastq.virus",
    filter:
      'sample != "" && type != "" && quality != "" && dilution != "" && extraction != "" && library_prep != ""',
  })) as FilteredFastq[];

  const resultMap = new Map<
    string,
    {
      fastqName: string;
      type: string;
      quality: string;
      dilution: string;
      extraction: string;
      libraryPrep: string;
      sampleId: string;
      virusId: string;
      annotation: string;
      sampleName: string;
      virusUuid: string;
    }
  >();

  for (const fastq of annotatedFastqs) {
    console.log(typeof fastq.date, fastq.date, fastq.name);
    if (duplicateNames.has(fastq.name + fastq.date)) {
      throw new Error(
        `Fastq with duplicate name found in export data: ${fastq.name}`,
      );
    }

    const contaminationVirusIds = new Set<string>();
    if (fastq.expand.exceptions_via_fastq) {
      for (const exception of fastq.expand.exceptions_via_fastq) {
        if (exception.type === "Contamination") {
          contaminationVirusIds.add(exception.virus);
        }
      }
    }

    if (fastq.expand.sample && fastq.expand.sample.expand.viruses) {
      for (const virus of fastq.expand.sample.expand.viruses) {
        if (contaminationVirusIds.has(virus.id)) {
          continue; // Skip contaminated viruses
        }
        resultMap.set(
          formatFastqKey(fastq, virus),
          formatLabelerOutput(fastq, virus),
        );
      }
    }
  }

  for (const fastq of annotatedFastqs) {
    if (fastq.expand.exceptions_via_fastq) {
      for (const exception of fastq.expand.exceptions_via_fastq) {
        if (exception.expand.virus) {
          const virus = exception.expand.virus;
          const key = formatFastqKey(fastq, virus);

          if (exception.type === "Missing") {
            if (!resultMap.has(key)) {
              throw new Error(
                `Missing exception for a virus that is not in the sample. Fastq: ${fastq.name}, Virus: ${virus.name}`,
              );
            }
            const entry = resultMap.get(key)!;
            entry.annotation = "missing";
          } else if (exception.type === "Contamination") {
            if (resultMap.has(key)) {
              // This should not happen due to the logic in the first loop
              console.warn(
                `Contamination exception for a virus that is already in the sample. Fastq: ${fastq.name}, Virus: ${virus.name}`,
              );
            } else {
              resultMap.set(
                key,
                formatLabelerOutput(fastq, virus, "contamination"),
              );
            }
          }
        }
      }
    }
  }

  const result = Array.from(resultMap.values());

  const csv = papa.unparse(result, {
    columns: [
      "fastqName",
      "type",
      "quality",
      "dilution",
      "extraction",
      "libraryPrep",
      "sampleId",
      "sampleName",
      "virusId",
      "virusUuid",
      "annotation",
    ],
  });

  fs.writeFileSync("viruses.csv", csv);

  const paths = annotatedFastqs.map(
    (fastq) => `${fastq.path} ${formatFastqFileName(fastq)}`,
  );
  fs.writeFileSync("files.txt", paths.join("\n"));

  console.log("Successfully wrote to viruses.csv and files.txt");
}

main();
