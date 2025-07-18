import type { DateRange } from "react-day-picker";

export type FastqType = "dsRNA" | "smRNA" | "Unknown";
export type VirusType = "Satellite" | "Virus" | "Viroid";

export type Fastq = {
  id: string;
  dilutionFactor: number | null;
  name: string;
  path: string;
  quality: number | null;
  timestamp: Date;
  type: FastqType | null;
  excluded: boolean;
  sample: string | null;
};

export type Sample = {
  id: number;
  name: string;
};

export type Virus = {
  id: number;
  acronym: string;
  name: string;
  synonyms: string[];
  type: VirusType | null;
  uuid: string;
};

export type { DateRange };
