import { SampleFastqs } from "@/components/SampleFastqs.tsx";
import { SampleName } from "@/components/SampleName.tsx";
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
import {
  SelectAllCheckbox,
  SelectionCheckbox,
} from "@/components/ui/selection-checkbox.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { UnsetIcon } from "@/components/ui/unset.tsx";
import { usePocketBasePaginated } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq, Sample } from "@/types.ts";
import { Outlet } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";
import React, { useEffect } from "react";

export function Samples() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");

  const {
    data: samples = [],
    isLoading,
    error,
    totalPages = 1,
  } = usePocketBasePaginated<Sample>("samples", {
    page: currentPage,
    filter: searchValue ? `name ~ "${searchValue}"` : undefined,
  });

  // Fetch all FASTQs to calculate counts
  const { data: allFastqs = [] } = usePocketBasePaginated<Fastq>("fastqs", {
    skipTotal: true,
  });
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

  function handleVirusesClick(sample: Sample) {
    setEditingVirusesSample(sample);
  }

  function handleVirusesKeyDown(event: React.KeyboardEvent, sample: Sample) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingVirusesSample(sample);
    }
  }

  function handleVirusesDialogClose() {
    setEditingVirusesSample(null);
  }

  function handleFastqsClick(sample: Sample) {
    setEditingFastqsSample(sample);
  }

  function handleFastqsKeyDown(event: React.KeyboardEvent, sample: Sample) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingFastqsSample(sample);
    }
  }

  function handleFastqsDialogClose() {
    setEditingFastqsSample(null);
  }

  function getFastqCount(sampleId: string): number {
    return allFastqs.filter((fastq) => fastq.sample === sampleId).length;
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample) => (
            <TableRow key={sample.id}>
              <TableCell>
                <SelectionCheckbox
                  item={sample}
                  selectedItems={selectedIds}
                  onItemSelect={(item, event) => onToggle(item.id, event)}
                  getItemLabel={(item) => item.name}
                />
              </TableCell>
              <TableCell>
                <SampleName
                  sample={sample}
                  trigger={
                    <div
                      className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1 -mx-2 -my-1"
                      tabIndex={0}
                      role="button"
                      aria-label={`Edit name for sample: ${sample.name}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sample.name}</span>
                        <EditIcon className="h-3 w-3 opacity-0 group-hover:opacity-70 group-focus:opacity-70 transition-opacity ml-2 flex-shrink-0" />
                      </div>
                    </div>
                  }
                />
              </TableCell>
              <TableCell>
                <div
                  className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1 -mx-2 -my-1"
                  tabIndex={0}
                  role="button"
                  aria-label={`Edit FASTQs for ${sample.name}. Currently has ${getFastqCount(sample.id)} FASTQs assigned`}
                  onClick={() => handleFastqsClick(sample)}
                  onKeyDown={(e) => handleFastqsKeyDown(e, sample)}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {(() => {
                        const count = getFastqCount(sample.id);
                        return count ? (
                          `${count} FASTQ${count === 1 ? "" : "s"}`
                        ) : (
                          <UnsetIcon />
                        );
                      })()}
                    </span>
                    <EditIcon className="h-3 w-3 opacity-0 group-hover:opacity-70 group-focus:opacity-70 transition-opacity ml-2 flex-shrink-0" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div
                  className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1 -mx-2 -my-1"
                  tabIndex={0}
                  role="button"
                  aria-label={`Edit virus labels for ${sample.name}. Currently has ${sample.viruses?.length || 0} viruses assigned`}
                  onClick={() => handleVirusesClick(sample)}
                  onKeyDown={(e) => handleVirusesKeyDown(e, sample)}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {sample.viruses?.length ? (
                        `${sample.viruses.length} virus${sample.viruses.length === 1 ? "" : "es"}`
                      ) : (
                        <UnsetIcon />
                      )}
                    </span>
                    <EditIcon className="h-3 w-3 opacity-0 group-hover:opacity-70 group-focus:opacity-70 transition-opacity ml-2 flex-shrink-0" />
                  </div>
                </div>
              </TableCell>
            </TableRow>
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
