import { VirusSelection } from "@/components/VirusSelection.tsx";
import { VirusType } from "@/components/VirusType.tsx";
import { Badge } from "@/components/ui/badge.tsx";
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
import {
  usePocketBaseCount,
  usePocketBasePaginated,
} from "@/hooks/usePocketBase.ts";
import { useSelection } from "@/hooks/useSelection.ts";
import type { Virus } from "@/types.ts";
import { Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export function Viruses() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Get filter for current tab
  const filter = useMemo(() => {
    switch (activeTab) {
      case "typed":
        return "type != null";
      case "untyped":
        return "type = null";
      default:
        return "";
    }
  }, [activeTab]);

  const {
    data: viruses = [],
    loading,
    error,
    totalPages,
    totalItems,
    refetch,
  } = usePocketBasePaginated<Virus>("viruses", {
    sort: "name",
    page: currentPage,
    perPage: itemsPerPage,
    filter,
  });

  // Get counts for badges
  const { count: allCount } = usePocketBaseCount("viruses");
  const { count: typedCount } = usePocketBaseCount("viruses", "type != null");
  const { count: untypedCount } = usePocketBaseCount("viruses", "type = null");

  // Reset to page 1 when tab changes
  useMemo(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const {
    selectedItems: selectedViruses,
    selectedCount,
    isAllSelected,
    handleItemSelect: handleVirusSelect,
    handleSelectAll,
    clearSelection,
  } = useSelection(viruses);

  const renderVirusTable = (virusList: typeof viruses) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <SelectAllCheckbox
              items={virusList}
              isAllSelected={isAllSelected}
              onSelectAll={handleSelectAll}
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
                selectedItems={selectedViruses}
                onItemSelect={handleVirusSelect}
                getItemLabel={(item) => item.name}
              />
            </TableCell>
            <TableCell className="font-medium">
              <Link to={`/viruses/${virus.id}`}>{virus.name}</Link>
            </TableCell>
            <TableCell>
              <VirusType type={virus.type} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
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
            {loading && <LoadingIndicator />}
          </div>
          <TabsContent value="all">{renderVirusTable(viruses)}</TabsContent>
          <TabsContent value="typed">{renderVirusTable(viruses)}</TabsContent>
          <TabsContent value="untyped">{renderVirusTable(viruses)}</TabsContent>
        </Tabs>

        {totalPages > 1 && (
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
        )}
      </div>

      <VirusSelection
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
      />

      <Outlet />
    </>
  );
}
