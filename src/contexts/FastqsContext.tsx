import { convertPbToUi } from "@/hooks/useFastqs.ts";
import { usePocketBasePaginated } from "@/hooks/usePocketBaseQuery.ts";
import { pb } from "@/lib/pocketbase.ts";
import type { DateRange, Fastq, FastqTypeFilter, Sample } from "@/types.ts";
import { createContext, useMemo, useState, type ReactNode } from "react";

// PocketBase file interface
type PocketBaseFile = {
  id: string;
  name: string;
  path: string;
  date: string;
  quality_rating: "good" | "borderline" | "bad" | null;
  dilution_factor: number | null;
  type: string | null;
  excluded: boolean | null;
  sample: string | null;
  created: string;
  updated: string;
  expand?: {
    sample?: Sample;
  };
};

type FastqsContextType = {
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

export const FastqsContext = createContext<FastqsContextType | null>(null);

type FastqsProviderProps = {
  children: ReactNode;
  page?: number;
  onPageChange?: (page: number) => void;
};

export function FastqsProvider({
  children,
  page: externalPage,
  onPageChange,
}: FastqsProviderProps) {
  const [internalPage, setInternalPage] = useState(1);
  const [category, setCategory] = useState("unannotated");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<FastqTypeFilter>({
    dsRNA: false,
    smRNA: false,
    unknown: false,
  });

  const itemsPerPage = 25;

  const currentPage = externalPage ?? internalPage;

  const computedFilter = useMemo(() => {
    const conditions: string[] = [];

    if (category === "unannotated") {
      conditions.push(
        "(excluded = null || excluded = false) && (type = null || quality_rating = null || dilution_factor = null)",
      );
    } else if (category === "unassigned") {
      conditions.push(
        "(excluded = null || excluded = false) && (sample = null || sample = '')",
      );
    } else if (category === "excluded") {
      conditions.push("excluded = true");
    } else if (category === "done") {
      conditions.push(
        "(excluded = null || excluded = false) && type != null && quality_rating != null && dilution_factor != null && sample != null && sample != ''",
      );
    }

    if (typeFilter.dsRNA || typeFilter.smRNA || typeFilter.unknown) {
      const typeConditions: string[] = [];

      if (typeFilter.dsRNA) typeConditions.push("type = 'dsRNA'");
      if (typeFilter.smRNA) typeConditions.push("type = 'smRNA'");
      if (typeFilter.unknown) {
        typeConditions.push("(type = 'Unknown' || type = null)");
      }

      conditions.push(`(${typeConditions.join(" || ")})`);
    }

    if (dateRange?.from) {
      const fromDate = dateRange.from.toISOString();
      const toDate = (dateRange.to || dateRange.from).toISOString();
      conditions.push(`date >= '${fromDate}' && date <= '${toDate}'`);
    }

    return conditions.join(" && ");
  }, [category, dateRange, typeFilter]);

  function setCurrentPage(page: number) {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
  }

  const {
    data: pbFiles,
    isLoading,
    error,
    totalPages,
    refetch,
  } = usePocketBasePaginated<PocketBaseFile>("files", {
    expand: "sample",
    page: currentPage,
    perPage: itemsPerPage,
    filter: computedFilter || undefined,
  });

  async function updateMultiple(
    updates: Array<Partial<Fastq> & { id: string }>,
  ) {
    try {
      await Promise.all(
        updates.map((update) => {
          const params: Record<string, any> = {};

          if (update.excluded !== undefined) params.excluded = update.excluded;
          if (update.type !== undefined) params.type = update.type;
          if (update.quality !== undefined) {
            params.quality_rating = update.quality;
          }
          if (update.dilutionFactor !== undefined)
            params.dilution_factor = update.dilutionFactor;
          if (update.sample !== undefined) params.sample = update.sample;

          return pb.collection("files").update(update.id, params);
        }),
      );
      refetch();
    } catch (error) {
      console.error("Failed to update fastqs:", error);
      throw error;
    }
  }

  const fastqs = pbFiles.map((pbFile) => convertPbToUi(pbFile));

  return (
    <FastqsContext.Provider
      value={{
        category,
        dateRange,
        error,
        fastqs,
        isLoading,
        page: currentPage,
        refetch,
        setCategory,
        setDateRange,
        setPage: setCurrentPage,
        setTypeFilter,
        totalPages,
        typeFilter,
        updateMultiple,
      }}
    >
      {children}
    </FastqsContext.Provider>
  );
}
