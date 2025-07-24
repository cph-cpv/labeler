import { FastqsSelection } from "@/components/FastqsSelection.tsx";
import { FastqsTable } from "@/components/FastqsTable.tsx";
import { FastqsTabs } from "@/components/FastqsTabs.tsx";
import { FastqsTypeDropdown } from "@/components/FastqsTypeDropdown.tsx";
import { DateRangePicker } from "@/components/ui/date-range.tsx";
import { Header } from "@/components/ui/header.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination.tsx";
import { SelectionProvider } from "@/contexts/SelectionContext.tsx";
import { convertPbToUi } from "@/hooks/useFastqs.ts";
import { usePocketBasePaginated } from "@/hooks/usePocketBaseQuery.ts";
import type { DateRange, FastqTypeFilter } from "@/types.ts";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

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
    sample?: { id: string; name: string };
  };
};

export function Fastqs() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const category = search.category ?? "unannotated";
  const urlTypeFilter = Array.isArray(search.type)
    ? search.type
    : search.type
      ? [search.type]
      : [];
  const searchQuery = search.search ?? "";
  const page = search.page ?? 1;

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const typeFilter: FastqTypeFilter = {
    dsRNA: urlTypeFilter.includes("dsRNA"),
    smRNA: urlTypeFilter.includes("smRNA"),
    unknown: urlTypeFilter.includes("Unknown"),
  };

  function setCategory(newCategory: string) {
    navigate({ search: (prev) => ({ ...prev, category: newCategory }) });
  }

  function setSearchQuery(newSearchQuery: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        search: newSearchQuery || undefined,
      }),
    });
  }

  function getPageUrl(newPage: number) {
    return {
      search: (prev: any) => ({
        ...prev,
        page: newPage === 1 ? undefined : newPage,
      }),
    };
  }

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
  } = usePocketBasePaginated<PocketBaseFile>("fastqs", {
    expand: "sample",
    filter: computedFilter || undefined,
    page,
  });

  const fastqs = pbFastqs
    .map((pbFile) => convertPbToUi(pbFile))
    .filter(Boolean);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      navigate({
        search: (prev) => ({
          ...prev,
          page: undefined,
        }),
      });
    }
  }, [category, dateRange, typeFilter, searchQuery, navigate]);

  if (error) {
    return (
      <>
        <Header title="FASTQs" />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Error loading FASTQs: {error.message}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="FASTQs" />
      <div className="flex items-center gap-2 mb-4">
        <FastqsTabs
          category={category}
          isLoading={isLoading}
          setCategory={setCategory}
        />
      </div>
      <div className="flex gap-2 items-center mb-4">
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FastqsTypeDropdown />
        <DateRangePicker
          placeholder="Run Date"
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <SelectionProvider items={fastqs}>
        <FastqsTable fastqs={fastqs} />

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                {page === 1 ? (
                  <PaginationPrevious className="pointer-events-none opacity-50" />
                ) : (
                  <Link
                    to="/fastqs"
                    {...getPageUrl(page - 1)}
                    className="gap-1 px-2.5 sm:pl-2.5 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10"
                    aria-label="Go to previous page"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span className="hidden sm:block">Previous</span>
                  </Link>
                )}
              </PaginationItem>

              {(() => {
                const maxVisiblePages = 5;
                const halfVisible = Math.floor(maxVisiblePages / 2);
                let startPage = Math.max(1, page - halfVisible);
                let endPage = Math.min(
                  totalPages,
                  startPage + maxVisiblePages - 1,
                );

                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                return Array.from(
                  { length: endPage - startPage + 1 },
                  (_, i) => startPage + i,
                ).map((targetPage) => (
                  <PaginationItem key={targetPage}>
                    <Link
                      to="/fastqs"
                      {...getPageUrl(targetPage)}
                      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 ${page === targetPage ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
                      aria-current={page === targetPage ? "page" : undefined}
                    >
                      {targetPage}
                    </Link>
                  </PaginationItem>
                ));
              })()}

              <PaginationItem>
                {page === totalPages ? (
                  <PaginationNext className="pointer-events-none opacity-50" />
                ) : (
                  <Link
                    to="/fastqs"
                    {...getPageUrl(page + 1)}
                    className="gap-1 px-2.5 sm:pr-2.5 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10"
                    aria-label="Go to next page"
                  >
                    <span className="hidden sm:block">Next</span>
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        <FastqsSelection category={category} />
      </SelectionProvider>
    </>
  );
}
