import type { Fastq } from "@/types.ts";

export function convertPbToUiFastq(pbFile: any): Fastq | null {
  return pbFile
    ? {
        id: pbFile.id,
        name: pbFile.name,
        path: pbFile.path,
        timestamp: pbFile.date ? new Date(pbFile.date) : new Date(),
        quality: pbFile.quality_rating ?? null,
        dilutionFactor: pbFile.dilution_factor,
        type:
          pbFile.type === "dsRNA"
            ? "dsRNA"
            : pbFile.type === "smRNA"
              ? "smRNA"
              : pbFile.type === "Unknown"
                ? "Unknown"
                : null,
        sample: pbFile.expand?.sample?.name || null,
        excluded: pbFile.excluded || false,
      }
    : null;
}
