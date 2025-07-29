import { usePocketBaseCollection } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, Virus } from "@/types.ts";

export type ExceptionType = "Contamination" | "Missing";

export type Exception = {
  id: string;
  fastq: Fastq;
  type: ExceptionType;
  virus: Virus;
};

export type ExceptionCreation = {
  fastq: string;
  sample: string;
  type: "Contamination" | "Missing";
  virus: string;
};

export type ExceptionPocketBase = {
  id: string;
  expand: {
    fastq: Fastq;
    virus: Virus;
  };
  type: ExceptionType;
};

export type UseExceptionsReturn = {
  exceptions?: Exception[];
  isLoading: boolean;
};

export function useExceptions(sampleId: string): UseExceptionsReturn {
  const { data, isLoading } = usePocketBaseCollection<ExceptionPocketBase>(
    "exceptions",
    {
      expand: "fastq,virus",
      filter: `fastq.sample.id = "${sampleId}"`,
    },
  );

  if (isLoading) return { exceptions: undefined, isLoading: true };

  return {
    exceptions: data.map((datum) => {
      return {
        id: datum.id,
        fastq: datum.expand.fastq,
        type: datum.type,
        virus: datum.expand.virus,
      };
    }),
    isLoading: false,
  };
}
