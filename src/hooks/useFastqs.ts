import { convertPbToUiFastq } from "@/lib/convert.ts";
import type { Fastq, FastqsCategory, FastqTypeFilter } from "@/types.ts";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { usePocketBasePaginated } from "./usePocketBaseQuery.ts";

type UseFastqsParams = {
  category: FastqsCategory;
  typeFilter: FastqTypeFilter;
  searchQuery: string;
  dateRange: DateRange | undefined;
  page: number;
};

type UseFastqsReturn = {
  fastqs: Fastq[];
  isLoading: boolean;
  error: any;
  totalPages: number;
};

export function useFastqs({
  category,
  typeFilter,
  searchQuery,
  dateRange,
  page,
}: UseFastqsParams): UseFastqsReturn {
  const computedFilter = useMemo(() => {
    const conditions: string[] = [];

    if (category === "todo") {
      conditions.push(
        "(excluded = null || excluded = false) && (type = null || quality = null || dilution = null || sample = null || sample = '')",
      );
    } else if (category === "excluded") {
      conditions.push("excluded = true");
    } else if (category === "done") {
      conditions.push(
        "(excluded = null || excluded = false) && type != null && quality != null && dilution != null && sample != null && sample != ''",
      );
    }

    if (typeFilter.dsRNA || typeFilter.smRNA || typeFilter.ribominus || typeFilter.totRNA || typeFilter.unknown) {
      const typeConditions: string[] = [];

      if (typeFilter.dsRNA) typeConditions.push("type='dsRNA'");
      if (typeFilter.smRNA) typeConditions.push("type='smRNA'");
      if (typeFilter.ribominus) typeConditions.push("type='ribominus'");
      if (typeFilter.totRNA) typeConditions.push("type='totRNA'");
      if (typeFilter.unknown) {
        typeConditions.push("type=null");
      }

      conditions.push(`(${typeConditions.join(" || ")})`);
    }

    if (dateRange?.from) {
      const fromDate = dateRange.from.toISOString();
      const toDate = (dateRange.to || dateRange.from).toISOString();
      conditions.push(`date >= '${fromDate}' && date <= '${toDate}'`);
    }

    if (searchQuery.trim()) {
      conditions.push(`(name ~ '${searchQuery}' || path ~ '${searchQuery}')`);
    }

    return conditions.join(" && ");
  }, [category, dateRange, typeFilter, searchQuery]);

  const {
    data: pbFastqs = [],
    isLoading,
    error,
    totalPages,
  } = usePocketBasePaginated<Fastq>("fastqs", {
    filter: computedFilter || undefined,
    expand: "sample",
    page,
  });

  const fastqs = pbFastqs
    .map((pbFile) => convertPbToUiFastq(pbFile))
    .filter((fastq): fastq is Fastq => fastq !== null);

  return {
    fastqs,
    isLoading,
    error,
    totalPages,
  };
}
