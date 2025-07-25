import type { FastqDilution } from "@/lib/dilution.ts";
import type { DateRange } from "react-day-picker";

export type FastqQuality = 1 | 2 | 3 | 4 | 5;

export type FastqType = "dsRNA" | "smRNA" | "Unknown";

export type FastqsCategory = "todo" | "excluded" | "done";

export type VirusesCategory = "all" | "typed" | "untyped";

export type FastqTypeFilter = {
  dsRNA: boolean;
  smRNA: boolean;
  unknown: boolean;
};

export type Fastq = {
  id: string;
  dilution: FastqDilution | null;
  excluded: boolean;
  name: string;
  path: string;
  quality: FastqQuality | null;
  timestamp: Date;
  type: FastqType | null;
  sample: string | null;
};

export type FastqUpdate = {
  id: string;
  dilution: FastqDilution | null;
  excluded: boolean;
  quality: FastqQuality | null;
  sample: string | null;
};

export type Sample = {
  id: string;
  name: string;
};

export type SampleUpdate = Sample;

export type VirusType = "Satellite" | "Virus" | "Viroid";

export type Virus = {
  id: string;
  acronym: string;
  name: string;
  synonyms: string[];
  type: VirusType | null;
  uuid: string;
};

export type ClientResponseError = Error & {
  url: string;
  status: number;
  response: Record<string, any>;
  isAbort: boolean;
  originalError: Error | null;
};

export type PocketBaseError = ClientResponseError & {
  notFound: boolean;
};

export type { DateRange };
