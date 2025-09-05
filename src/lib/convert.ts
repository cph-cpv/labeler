import type { Fastq } from "@/types.ts";
import { FastqTypes } from "@/types.ts";

export function convertPbToUiFastq(pbFile: any): Fastq | null {
  return pbFile
    ? {
        id: pbFile.id,
        name: pbFile.name,
        path: pbFile.path,
        timestamp: pbFile.date ? new Date(pbFile.date) : new Date(),
        quality: pbFile.quality ?? null,
        dilution: pbFile.dilution,
        type: FastqTypes.includes(pbFile.type) ? pbFile.type : null,
        sample: pbFile.expand?.sample?.name || null,
        excluded: pbFile.excluded || false,
      }
    : null;
}
