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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination.tsx";
import { SelectionProvider } from "@/contexts/SelectionContext.tsx";
import { useFastqs } from "@/hooks/useFastqs.ts";

export function Fastqs() {
  const { dateRange, error, fastqs, page, setDateRange, setPage, totalPages } =
    useFastqs();

  console.log(page, totalPages);

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
        <FastqsTabs />
      </div>
      <div className="flex gap-2 items-center mb-4">
        <Input placeholder="Search" />
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
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
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
                    <PaginationLink
                      onClick={() => setPage(targetPage)}
                      isActive={page === targetPage}
                      className="cursor-pointer"
                    >
                      {targetPage}
                    </PaginationLink>
                  </PaginationItem>
                ));
              })()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        <FastqsSelection />
      </SelectionProvider>
    </>
  );
}
