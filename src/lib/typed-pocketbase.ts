import type { Fastq, Sample, Virus } from "@/types";
import PocketBase, { type RecordService } from "pocketbase";

// Exception types
type FastqExceptionType = "missing" | "contamination";

// Exception record type based on collections.ts
type FastqException = {
  id: string;
  viruses: string; // relation ID
  type: FastqExceptionType;
  created: string;
  updated: string;
};

// PocketBase record types with the standard fields
type FastqRecord = Fastq & {
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
  expand?: {
    sample?: SampleRecord;
    exceptions?: FastqExceptionRecord;
  };
};

type SampleRecord = Sample & {
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
  expand?: {
    viruses?: VirusRecord[];
  };
};

type VirusRecord = Virus & {
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
};

type FastqExceptionRecord = FastqException & {
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
  expand?: {
    viruses?: VirusRecord;
  };
};

// TypedPocketBase interface that extends the base PocketBase
interface TypedPocketBase extends PocketBase {
  collection(idOrName: string): RecordService; // default fallback
  collection(idOrName: "fastqs"): RecordService<FastqRecord>;
  collection(idOrName: "samples"): RecordService<SampleRecord>;
  collection(idOrName: "viruses"): RecordService<VirusRecord>;
  collection(idOrName: "exceptions"): RecordService<FastqExceptionRecord>;
}

export function createTypedPocketBase(baseUrl: string): TypedPocketBase {
  return new PocketBase(baseUrl) as TypedPocketBase;
}

export type {
  FastqException,
  FastqExceptionRecord,
  FastqExceptionType,
  FastqRecord,
  SampleRecord,
  TypedPocketBase,
  VirusRecord,
};
