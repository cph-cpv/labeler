import { FastqsContext } from "@/contexts/FastqsContext.tsx";
import { usePocketBaseRecord } from "@/hooks/usePocketBase.ts";
import { pb } from "@/lib/pocketbase.ts";
import type { DateRange, Fastq, FastqTypeFilter } from "@/types.ts";
import { useContext, useEffect } from "react";

type UseFastqReturn = {
  error: Error | null;
  fastq: Fastq | null;
  isLoading: boolean;
  notFound: boolean;
  refetch: () => void;
  update: (updates: Partial<Fastq>) => void;
};

export function useFastq(id: string): UseFastqReturn {
  const context = useContext(FastqsContext);

  if (!context) {
    throw new Error("useFastqsContext must be used within a FastqsProvider");
  }

  const {
    data: pbFile,
    loading: isLoading,
    error,
    notFound,
  } = usePocketBaseRecord("files", id, { expand: "sample" });

  let { refetch } = context;

  if (context.isLoading) {
    refetch = () => {};
  }

  // Convert PocketBase data to UI format
  const fastq: Fastq | null = pbFile
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

  function update(updates: Partial<Fastq>) {
    // Convert UI format back to PocketBase format
    const pbData: Record<string, any> = {};

    if (updates.excluded !== undefined) pbData.excluded = updates.excluded;
    if (updates.type !== undefined) pbData.type = updates.type;
    if (updates.quality !== undefined) {
      pbData.quality_rating =
        updates.quality === 5
          ? "good"
          : updates.quality === 3
            ? "borderline"
            : updates.quality === 1
              ? "bad"
              : null;
    }
    if (updates.dilutionFactor !== undefined)
      pbData.dilution_factor = updates.dilutionFactor;
    if (updates.sample !== undefined) pbData.sample = updates.sample;

    pb.collection("files")
      .update(id, pbData)
      .then(() => {
        refetch();
      })
      .catch((error) => {
        console.error("Failed to update fastq:", error);
      });
  }

  return {
    error,
    fastq,
    isLoading: context.isLoading || isLoading,
    notFound,
    refetch,
    update,
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
    throw new Error("useFastqsContext must be used within a FastqsProvider");
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
