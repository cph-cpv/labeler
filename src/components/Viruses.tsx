import { VirusSelection } from "@/components/VirusSelection.tsx";
import { VirusType } from "@/components/VirusType.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Link } from "@/components/ui/link.tsx";
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
  SelectAllCheckbox,
  SelectionCheckbox,
} from "@/components/ui/selection-checkbox.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";
import { useViruses } from "@/hooks/useViruses.ts";
import type { Virus, VirusesCategory } from "@/types.ts";
import { Outlet, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";

export function Viruses() {
  const navigate = useNavigate({ from: "/viruses" });
  const search = useSearch({ from: "/viruses" });
  const activeTab = search.category ?? "all";
  const currentPage = search.page ?? 1;
  const searchTerm = search.search ?? "";

  function setCategory(category: string) {
    navigate({
      search: { ...search, category: category as VirusesCategory, page: 1 },
    });
  }

  function setCurrentPage(page: number) {
    navigate({
      search: { ...search, page },
    });
  }

  function setSearchTerm(searchTerm: string) {
    navigate({
      search: { ...search, search: searchTerm, page: 1 },
    });
  }

  const {
    counts,
    error,
    isLoading: virusesLoading,
    totalPages,
    viruses,
  } = useViruses({
    category: activeTab,
    page: currentPage,
    search: searchTerm,
  });

  const { allCount, typedCount, untypedCount } = counts;

  const { isAllSelected, onSelectAll, onSetItems, onToggle, selectedIds } =
    useSelection<Virus>();

  // Set the viruses in the selection context when they change
  useEffect(() => {
    if (viruses) {
      onSetItems(viruses);
    }
  }, [viruses, onSetItems]);

  function renderVirusTable(virusList: typeof viruses) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <SelectAllCheckbox
                isAllSelected={isAllSelected}
                items={virusList}
                onSelectAll={onSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {virusList.map((virus) => (
            <TableRow key={virus.id}>
              <TableCell>
                <SelectionCheckbox
                  item={virus}
                  selectedItems={selectedIds}
                  onItemSelect={(item, event) => onToggle(item.id, event)}
                  getItemLabel={(item) => item.name}
                />
              </TableCell>
              <TableCell className="font-medium">
                <Link to="/viruses/$id" params={{ id: virus.id.toString() }}>
                  {virus.name}
                </Link>
              </TableCell>
              <TableCell>
                <VirusType type={virus.type} />
              </TableCell>
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
        <header>
          <h1 className="font-bold text-2xl">Viruses</h1>
          <p className="font-medium text-gray-500">
            Viruses from the Virtool reference.
          </p>
        </header>
        <Tabs value={activeTab} onValueChange={setCategory} className="mt-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">
                All{" "}
                <Badge variant={activeTab === "all" ? "default" : "outline"}>
                  {allCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="typed">
                Typed{" "}
                <Badge variant={activeTab === "typed" ? "default" : "outline"}>
                  {typedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="untyped">
                Untyped{" "}
                <Badge
                  variant={activeTab === "untyped" ? "default" : "outline"}
                >
                  {untypedCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
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

          <TabsContent value="all">{renderVirusTable(viruses)}</TabsContent>
          <TabsContent value="typed">{renderVirusTable(viruses)}</TabsContent>
          <TabsContent value="untyped">{renderVirusTable(viruses)}</TabsContent>
        </Tabs>

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

      <VirusSelection />
      <Outlet />
    </>
  );
}
