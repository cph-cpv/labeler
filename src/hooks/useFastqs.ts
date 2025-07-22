import { FastqsContext } from "@/contexts/FastqsContext.tsx";
import { usePocketBaseRecord } from "@/hooks/usePocketBase.ts";
import { pb } from "@/lib/pocketbase.ts";
import type { DateRange, Fastq, FastqTypeFilter } from "@/types.ts";
import { useCallback, useContext, useEffect } from "react";

type UseFastqReturn = {
  error: Error | null;
  fastq: Fastq | null;
  isLoading: boolean;
  notFound: boolean;
  refetch: () => void;
  update: (updates: Partial<Fastq>) => void;
};

function convertPbToUi(pbFile: any): Fastq | null {
  return pbFile
    ? {
        id: pbFile.id,
        name: pbFile.name,
        path: pbFile.path,
        timestamp: pbFile.date ? new Date(pbFile.date) : new Date(),
        quality:
          pbFile.quality_rating === "good"
            ? 5
            : pbFile.quality_rating === "borderline"
              ? 3
              : pbFile.quality_rating === "bad"
                ? 1
                : null,
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

export function useFastq(id: string): UseFastqReturn {
  const context = useContext(FastqsContext);

  if (!context) {
    throw new Error("useFastq must be used within a FastqsProvider");
  }

  const {
    data: pbFile,
    error,
    isLoading,
    notFound,
  } = usePocketBaseRecord("files", id, { expand: "sample" });

  const refetch = context.isLoading ? () => {} : context.refetch;

  const fastq = pbFile ? convertPbToUi(pbFile) : null;

  const updateAndSetRecord = useCallback(
    async (update: Partial<Fastq>) => {
      const query: Record<string, any> = {};

      if (update.excluded !== undefined) query.excluded = update.excluded;
      if (update.type !== undefined) query.type = update.type;
      if (update.quality !== undefined) {
        query.quality_rating =
          update.quality === 5
            ? "good"
            : update.quality === 3
              ? "borderline"
              : update.quality === 1
                ? "bad"
                : null;
      }

      if (update.dilutionFactor !== undefined)
        query.dilution_factor = update.dilutionFactor;

      if (update.sample !== undefined) query.sample = update.sample;

      await pb.collection("files").update(id, query);
      refetch();
    },
    [id],
  );

  return {
    error,
    fastq,
    isLoading: context.isLoading || isLoading,
    notFound,
    refetch,
    update: updateAndSetRecord,
  };
}

type UseFastqsReturn = {
  category: string;
  dateRange: DateRange | undefined;
  error: Error | null;
  fastqs: Fastq[];
  isLoading: boolean;
  page: number;
  refetch: () => void;
  setCategory: (category: string) => void;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setPage: (page: number) => void;
  setTypeFilter: (typeFilter: FastqTypeFilter) => void;
  totalPages: number;
  typeFilter: FastqTypeFilter;
  updateMultiple: (
    updates: Array<Partial<Fastq> & { id: string }>,
  ) => Promise<void>;
};

export function useFastqs(): UseFastqsReturn {
  const context = useContext(FastqsContext);

  if (!context) {
    throw new Error("useFastqs must be used within a FastqsProvider");
  }

  const {
    category,
    dateRange,
    error,
    fastqs,
    isLoading,
    page,
    refetch,
    setCategory,
    setDateRange,
    setPage,
    setTypeFilter,
    totalPages,
    typeFilter,
    updateMultiple,
  } = context;

  // Reset to page 1 when filters change.
  useEffect(() => {
    setPage(1);
  }, [category, dateRange, setPage, typeFilter]);

  return {
    category,
    dateRange,
    error,
    fastqs,
    isLoading,
    page,
    refetch,
    setCategory,
    setDateRange,
    setPage,
    setTypeFilter,
    totalPages,
    typeFilter,
    updateMultiple,
  };
}
