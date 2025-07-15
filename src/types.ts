import { DateRange } from "react-day-picker";

type FastqType = "dsRNA" | "smRNA" | "Unknown";
type VirusType = "SATELLITE" | "VIRUS" | "VIROID";

export type Fastq = {
  id: number;
  dilutionFactor: number | null;
  name: string;
  path: string;
  quality: number | null;
  timestamp: Date;
  type: FastqType | null;
  excluded: boolean;
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

export { DateRange };
