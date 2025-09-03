import { Header } from "@/components/ui/header.tsx";
import { Input } from "@/components/ui/input.tsx";
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { useViruses } from "@/hooks/useViruses.ts";
import { Outlet, useNavigate, useSearch } from "@tanstack/react-router";

export function Viruses() {
  const navigate = useNavigate({ from: "/viruses" });
  const search = useSearch({ from: "/viruses" });
  const currentPage: number = search.page ?? 1;
  const searchTerm = search.search ?? "";

  function setCurrentPage(page: number) {
    navigate({
      search: { ...search, page },
    });
  }

  function setSearchTerm(searchTerm: string) {
    const newSearch = { ...search, page: 1 };
    if (searchTerm.trim()) {
      newSearch.search = searchTerm;
    } else {
      delete newSearch.search;
    }
    navigate({ search: newSearch });
  }

  const {
    error,
    isLoading: virusesLoading,
    totalPages,
    viruses,
  } = useViruses({
    page: currentPage,
    search: searchTerm,
  });

  function renderVirusTable(virusList: typeof viruses) {
    return (
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Acronym</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {virusList.map((virus) => (
            <TableRow key={virus.id}>
              <TableCell className="font-medium">{virus.name}</TableCell>
              <TableCell>{virus.acronym}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div>
        <header>
          <h1 className="font-bold text-2xl">Viruses</h1>
          <p className="font-medium text-red-500">
            Error loading viruses: {error.message}
          </p>
        </header>
      </div>
    );
  }

  return (
    <>
      <div>
        <Header title="Viruses" subtitle="Viruses from the Virtool reference" />
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <LoadingIndicator isLoading={virusesLoading} />
          </div>

          <div className="mt-4">
            <Input
              type="text"
              placeholder="Search viruses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="mt-4">{renderVirusTable(viruses)}</div>
        </div>

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {(() => {
              if (!totalPages || totalPages <= 1) {
                return null;
              }

              const maxVisiblePages = 5;
              const halfVisible = Math.floor(maxVisiblePages / 2);
              let startPage = Math.max(1, currentPage - halfVisible);
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
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ));
            })()}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Outlet />
    </>
  );
}
