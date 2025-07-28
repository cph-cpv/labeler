import { SamplesCreate } from "@/components/SamplesCreate.tsx";
import { SamplesFastqsEdit } from "@/components/SamplesFastqsEdit.tsx";
import { SamplesLabel } from "@/components/SamplesLabel.tsx";
import { SamplesNameEdit } from "@/components/SamplesNameEdit.tsx";
import { SamplesSelection } from "@/components/SamplesSelection.tsx";
import { SamplesVirusesEdit } from "@/components/SamplesVirusesEdit.tsx";
import { Header } from "@/components/ui/header.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  SelectAllCheckbox,
  SelectionCheckbox,
} from "@/components/ui/selection-checkbox.tsx";
import { TableMissingIcon } from "@/components/ui/table-missing-icon.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { usePocketBaseCollection } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq, Sample } from "@/types.ts";
import { Outlet } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function Samples() {
  const {
    data: samples = [],
    isLoading,
    error,
  } = usePocketBaseCollection<Sample>("samples");

  // Fetch all FASTQs to calculate counts
  const { data: allFastqs = [] } = usePocketBaseCollection<Fastq>("fastqs");

  const [searchValue, setSearchValue] = React.useState("");
  const [labelDialogOpen, setLabelDialogOpen] = React.useState(false);
  const [editingVirusesSample, setEditingVirusesSample] =
    React.useState<Sample | null>(null);
  const [editingFastqsSample, setEditingFastqsSample] =
    React.useState<Sample | null>(null);
  const [editingNameSample, setEditingNameSample] =
    React.useState<Sample | null>(null);

  const filteredSamples = React.useMemo(() => {
    if (!searchValue) return samples;
    return samples.filter((sample) =>
      sample.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [samples, searchValue]);

  const {
    isAllSelected,
    onSelectAll,
    onSetItems,
    onToggle,
    selectedIds,
    selectedCount,
  } = useSelection<Sample>();

  // Set the samples in the selection context when they change
  useEffect(() => {
    if (filteredSamples) {
      onSetItems(filteredSamples);
    }
  }, [filteredSamples, onSetItems]);

  // Handle keyboard shortcuts
  useHotkeys(
    "l",
    () => {
      setLabelDialogOpen(true);
    },
    {
      enabled: selectedCount > 0,
      enableOnFormTags: false,
    },
  );

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

  function handleNameClick(sample: Sample) {
    setEditingNameSample(sample);
  }

  function handleNameKeyDown(event: React.KeyboardEvent, sample: Sample) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingNameSample(sample);
    }
  }

  function handleNameDialogClose() {
    setEditingNameSample(null);
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

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search samples by name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-1"
        />
        <SamplesCreate />
      </div>

      <Table>
        <TableCaption>Sample collection for virus detection.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHeader className="w-12">
              <SelectAllCheckbox
                isAllSelected={isAllSelected}
                items={filteredSamples}
                onSelectAll={onSelectAll}
              />
            </TableHeader>
            <TableHead>Name</TableHead>
            <TableHead>FASTQs</TableHead>
            <TableHead>Viruses</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSamples.map((sample) => (
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
                <div
                  className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1 -mx-2 -my-1"
                  tabIndex={0}
                  role="button"
                  aria-label={`Edit name for sample: ${sample.name}`}
                  onClick={() => handleNameClick(sample)}
                  onKeyDown={(e) => handleNameKeyDown(e, sample)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{sample.name}</span>
                    <EditIcon className="h-3 w-3 opacity-0 group-hover:opacity-70 group-focus:opacity-70 transition-opacity ml-2 flex-shrink-0" />
                  </div>
                </div>
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
                          <TableMissingIcon />
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
                        <TableMissingIcon />
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

      <SamplesSelection />

      <SamplesLabel
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
        selectedSampleIds={Array.from(selectedIds)}
        selectedCount={selectedCount}
      />

      <SamplesVirusesEdit
        sample={editingVirusesSample}
        isOpen={editingVirusesSample !== null}
        onClose={handleVirusesDialogClose}
      />

      <SamplesFastqsEdit
        sample={editingFastqsSample}
        isOpen={editingFastqsSample !== null}
        onClose={handleFastqsDialogClose}
      />

      <SamplesNameEdit
        sample={editingNameSample}
        isOpen={editingNameSample !== null}
        onClose={handleNameDialogClose}
      />

      <Outlet />
    </>
  );
}
