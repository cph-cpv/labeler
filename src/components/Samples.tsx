import { SampleFastqs } from "@/components/SampleFastqs.tsx";
import { SampleRow } from "@/components/SampleRow.tsx";
import { SamplesSelection } from "@/components/SamplesSelection.tsx";
import { SampleViruses } from "@/components/SampleViruses.tsx";
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
import { SelectAllCheckbox } from "@/components/ui/selection-checkbox.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { usePocketBasePaginated } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Sample, SampleExpanded } from "@/types.ts";
import { formatSamples } from "@/utils/samples.ts";
import { Outlet } from "@tanstack/react-router";
import React, { useEffect, useMemo } from "react";

export function Samples() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");

  const {
    data: baseSamples = [],
    isLoading,
    error,
    totalPages = 1,
  } = usePocketBasePaginated<SampleExpanded>("samples", {
    page: currentPage,
    filter: searchValue ? `name ~ "${searchValue}"` : undefined,
    expand: "viruses, fastqs_via_sample",
  });

  const samples = useMemo(() => formatSamples(baseSamples), [baseSamples]);

  const [editingVirusesSample, setEditingVirusesSample] =
    React.useState<Sample | null>(null);
  const [editingFastqsSample, setEditingFastqsSample] =
    React.useState<Sample | null>(null);

  const { isAllSelected, onSelectAll, onSetItems, onToggle, selectedIds } =
    useSelection<Sample>();

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  // Set the samples in the selection context when they change
  useEffect(() => {
    if (samples) {
      onSetItems(samples);
    }
  }, [samples, onSetItems]);

  function handleVirusesDialogClose() {
    setEditingVirusesSample(null);
  }

  function handleFastqsDialogClose() {
    setEditingFastqsSample(null);
  }

  if (isLoading) {
    return (
      <>
        <Header
          title="Samples"
          subtitle="All available samples for analysis."
        />
        <div className="text-center py-8">Loading samples...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          title="Samples"
          subtitle="All available samples for analysis."
        />
        <div className="text-center py-8 text-red-600">
          Error loading samples: {error.message}
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Samples" subtitle="All available samples for analysis." />

      <Input
        className="mb-4"
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search samples by name..."
        value={searchValue}
      />

      <Table>
        <TableCaption>Sample collection for virus detection.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <SelectAllCheckbox
                isAllSelected={isAllSelected}
                items={samples}
                onSelectAll={onSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>FASTQs</TableHead>
            <TableHead>Viruses</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample) => (
            <SampleRow
              key={sample.id}
              sample={sample}
              selectedIds={selectedIds}
              onToggle={onToggle}
              setEditingFastqsSample={setEditingFastqsSample}
              setEditingVirusesSample={setEditingVirusesSample}
            />
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

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
      )}

      <SamplesSelection />

      <SampleViruses
        sample={editingVirusesSample}
        isOpen={editingVirusesSample !== null}
        onClose={handleVirusesDialogClose}
      />

      <SampleFastqs
        sample={editingFastqsSample}
        isOpen={editingFastqsSample !== null}
        onClose={handleFastqsDialogClose}
      />

      <Outlet />
    </>
  );
}
