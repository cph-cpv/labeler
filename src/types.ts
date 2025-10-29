import type { ExceptionType } from "@/hooks/useExceptions.ts";
import type { FastqDilution } from "@/lib/dilution.ts";
import type { FastqQuality } from "@/lib/quality.ts";
import type { DateRange } from "react-day-picker";

export const FastqTypes = ["dsRNA", "smRNA", "ribominus", "totRNA"];

export const FastqExtractions = ["manual", "presto", "kingfisher", "external"];

export const FastqLibraryPreps = ["manual", "robotic", "external"];

export type FastqType = (typeof FastqTypes)[number];

export type FastqExtraction = (typeof FastqExtractions)[number];

export type FastqLibraryPrep = (typeof FastqLibraryPreps)[number];

export type FastqsCategory = "todo" | "excluded" | "done";

export type FastqTypeFilter = {
  dsRNA: boolean;
  smRNA: boolean;
  totRNA: boolean;
  ribominus: boolean;
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
  extraction: FastqExtraction | null;
  sample: string | null;
  library_prep: FastqLibraryPrep | null;
};

export type FastqUpdate = {
  id: string;
  dilution: FastqDilution | null;
  excluded: boolean;
  quality: FastqQuality | null;
  sample: string | null;
};

export type BaseSample = {
  id: string;
  name: string;
  viruses: string[];
};

export type Sample = Omit<BaseSample, "viruses"> & {
  viruses: Virus[];
  fastqs: Fastq[];
};

export type SampleExpanded = BaseSample & {
  expand: {
    viruses?: Virus[];
    fastqs_via_sample?: Fastq[];
  };
};

export type Exception = {
  id: string;
  type: ExceptionType;
  virus: Virus;
};

export type Virus = {
  id: string;
  acronym: string;
  name: string;
  synonyms: string[];
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
