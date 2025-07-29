import {
  usePocketBaseCollection,
  usePocketBasePaginated,
} from "@/hooks/usePocketBaseQuery";
import type { Virus } from "@/types";
import { useMemo } from "react";

type UseVirusesOptions = {
  page?: number;
  search?: string;
};

type VirusCounts = {
  allCount: number;
  typedCount: number;
  untypedCount: number;
};

type UseVirusesResult = {
  viruses: Virus[];
  counts: VirusCounts;
  isLoading: boolean;
  error: Error | null;
  totalPages?: number;
  totalItems?: number;
  page: number;
  perPage: number;
  refetch: () => void;
};

export function useViruses(options: UseVirusesOptions = {}): UseVirusesResult {
  const { page = 1, search = "" } = options;

  const searchFilter = useMemo(() => {
    if (!search) return "";
    return `name ~ "${search}" || acronym ~ "${search}"`;
  }, [search]);

  const filter = useMemo(() => {
    const filters = [searchFilter].filter(Boolean);
    return filters.join(" && ");
  }, [searchFilter]);

  // Query for paginated data
  const paginatedQuery = usePocketBasePaginated<Virus>("viruses", {
    page,
    filter,
    sort: "name",
  });

  // Query for counts - get all data but only fetch minimal fields (without search filter)
  const countsQuery = usePocketBaseCollection<Pick<Virus, "id" | "type">>(
    "viruses",
    {
      fields: "id,type",
    },
  );

  // Calculate counts from all data
  const counts = useMemo((): VirusCounts => {
    if (!countsQuery.data) {
      return { allCount: 0, typedCount: 0, untypedCount: 0 };
    }

    const allCount = countsQuery.data.length;
    const typedCount = countsQuery.data.filter((virus) => virus.type).length;
    const untypedCount = allCount - typedCount;

    return { allCount, typedCount, untypedCount };
  }, [countsQuery.data]);

  return {
    viruses: paginatedQuery.data,
    counts,
    isLoading: paginatedQuery.isLoading || countsQuery.isLoading,
    error: paginatedQuery.error || countsQuery.error,
    totalPages: paginatedQuery.totalPages,
    totalItems: paginatedQuery.totalItems,
    page: paginatedQuery.page,
    perPage: paginatedQuery.perPage,
    refetch: () => {
      paginatedQuery.refetch();
      countsQuery.refetch();
    },
  };
}
