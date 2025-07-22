import { FastqsContext } from "@/contexts/FastqsContext.tsx";
import type { DateRange, Fastq, FastqTypeFilter } from "@/types.ts";
import { useContext, useEffect } from "react";

export function convertPbToUi(pbFile: any): Fastq | null {
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
