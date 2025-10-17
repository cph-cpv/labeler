import { convertPbToUiFastq } from "@/lib/convert.ts";
import type { Fastq } from "@/types.ts";
import {
  usePocketBaseCollection,
  usePocketBasePaginated,
} from "./usePocketBaseQuery.ts";

type UseSampleFastqsParams = {
  sampleId: string | null;
  searchTerm?: string;
  page?: number;
  sort: string;
};

type UseSampleFastqsReturn = {
  associatedFastqs: Fastq[];
  searchResults: {
    fastqs: Fastq[];
    totalPages: number;
    totalItems: number;
  };
  isLoading: boolean;
};

export function useSampleFastqs({
  sampleId,
  searchTerm = "",
  page = 1,
  sort = "name",
}: UseSampleFastqsParams): UseSampleFastqsReturn {
  // Fetch FASTQs associated with this sample
  const { data: pbAssociatedFastqs = [], isLoading: isLoadingAssociated } =
    usePocketBaseCollection<Fastq>("fastqs", {
      filter: sampleId ? `sample = "${sampleId}"` : undefined,
      sort: "name",
    });

  const associatedFastqs = pbAssociatedFastqs
    .map(convertPbToUiFastq)
    .filter((fastq): fastq is Fastq => fastq !== null);

  // Fetch unassigned FASTQs for search (paginated)
  const searchFilter =
    searchTerm.trim().length === 0
      ? `(sample = null || sample = '') && (excluded = null || excluded = false)`
      : `(name ~ "${searchTerm}" || path ~ "${searchTerm}") && (sample = null || sample = '') && (excluded = null || excluded = false)`;

  const {
    data: pbSearchFastqs = [],
    isLoading: isLoadingSearch,
    totalPages,
    totalItems,
  } = usePocketBasePaginated<Fastq>("fastqs", {
    filter: searchFilter,
    sort,
    page,
  });

  const searchFastqs = pbSearchFastqs
    .map(convertPbToUiFastq)
    .filter((fastq): fastq is Fastq => fastq !== null);

  return {
    associatedFastqs,
    searchResults: {
      fastqs: searchFastqs,
      totalPages,
      totalItems,
    },
    isLoading: isLoadingAssociated && isLoadingSearch,
  };
}
