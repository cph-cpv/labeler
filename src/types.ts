import type { DateRange } from "react-day-picker";

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
