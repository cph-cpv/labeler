import type { DateRange } from "react-day-picker";

export type FastqType = "dsRNA" | "smRNA" | "Unknown";

export type FastqTypeFilter = {
  dsRNA: boolean;
  smRNA: boolean;
  unknown: boolean;
};

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
  id: string;
  name: string;
};

export type VirusType = "Satellite" | "Virus" | "Viroid";

export type Virus = {
  id: number;
  acronym: string;
  name: string;
  synonyms: string[];
  type: VirusType | null;
  uuid: string;
};

export type { DateRange };
