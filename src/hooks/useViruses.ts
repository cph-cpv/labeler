import { usePocketBasePaginated } from "@/hooks/usePocketBaseQuery";
import type { Virus } from "@/types";
import { useMemo } from "react";

type UseVirusesOptions = {
  page?: number;
  search?: string;
};

type UseVirusesResult = {
  viruses: Virus[];
  isLoading: boolean;
  error: Error | null;
  totalPages: number;
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

  return {
    viruses: paginatedQuery.data,
    isLoading: paginatedQuery.isLoading,
    error: paginatedQuery.error,
    totalPages: paginatedQuery.totalPages,
    totalItems: paginatedQuery.totalItems,
    page: paginatedQuery.page,
    perPage: paginatedQuery.perPage,
    refetch: paginatedQuery.refetch,
  };
}
