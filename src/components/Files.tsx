import { FilesAnnotate } from "@/components/FilesAnnotate.tsx";
import { FilesAssign } from "@/components/FilesAssign.tsx";
import { FilesHelp } from "@/components/FilesHelp.tsx";
import { FilesTable } from "@/components/FilesTable.tsx";
import {
  FilesTypeDropdown,
  type TypeFilter,
} from "@/components/FilesTypeDropdown.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DateRangePicker } from "@/components/ui/date-range.tsx";
import { Header } from "@/components/ui/header.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import { SelectionBar } from "@/components/ui/selection-bar.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useSelection } from "@/hooks/useSelection.ts";
import type { Fastq } from "@/types.ts";
import data from "@fake/fastq.json";
import { CheckCircle, Fingerprint, TestTube, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useHotkeys } from "react-hotkeys-hook";

const fastqs: Fastq[] = data.map((datum) => {
  return {
    ...datum,
    timestamp: new Date(datum.timestamp),
  };
});

export function Files() {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [annotateDialogOpen, setAnnotateDialogOpen] = useState(false);
  const [excludeDialogOpen, setExcludeDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState("unannotated");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>({
    dsRNA: false,
    smRNA: false,
    unknown: false,
  });

  const filteredFastqs = useMemo(() => {
    let filtered = fastqs;

    // Filter by tab selection
    if (activeTab === "unannotated") {
      // Missing one of type, quality, or dilution factor, and not excluded
      filtered = filtered.filter(
        (fastq) =>
          !fastq.excluded &&
          (fastq.type === null ||
            fastq.quality === null ||
            fastq.dilutionFactor === null),
      );
    } else if (activeTab === "unassigned") {
      // Not assigned to a sample, and not excluded (regardless of annotation status)
      filtered = filtered.filter(
        (fastq) => !fastq.excluded,
        // TODO: Add sample assignment check when sample field is added
        // For now, showing all non-excluded files since no sample assignment exists yet
      );
    } else if (activeTab === "excluded") {
      filtered = filtered.filter((fastq) => fastq.excluded);
    } else if (activeTab === "done") {
      // Has type, quality, dilution factor, and is assigned to a sample, and not excluded
      filtered = filtered.filter(
        (fastq) =>
          !fastq.excluded &&
          fastq.type !== null &&
          fastq.quality !== null &&
          fastq.dilutionFactor !== null,
        // TODO: Add sample assignment check when sample field is added
      );
    }

    // Filter by type if any types are selected
    const hasTypeFilters =
      typeFilter.dsRNA || typeFilter.smRNA || typeFilter.unknown;
    if (hasTypeFilters) {
      filtered = filtered.filter((fastq) => {
        if (typeFilter.dsRNA && fastq.type === "dsRNA") return true;
        if (typeFilter.smRNA && fastq.type === "smRNA") return true;
        if (
          typeFilter.unknown &&
          (fastq.type === "Unknown" || fastq.type === null)
        )
          return true;
        return false;
      });
    }

    // Filter by date range if specified
    if (dateRange?.from) {
      filtered = filtered.filter((fastq) => {
        const timestamp = fastq.timestamp;
        const fromDate = dateRange.from!;
        const toDate = dateRange.to || dateRange.from;

        return timestamp >= fromDate && timestamp <= toDate;
      });
    }

    return filtered;
  }, [activeTab, dateRange, typeFilter]);

  const {
    selectedItems: selectedFiles,
    selectedCount,
    handleItemSelect: handleFileSelect,
    handleSelectAll,
    clearSelection,
  } = useSelection(filteredFastqs);

  useHotkeys("e", () => {
    if (selectedCount > 0) {
      setExcludeDialogOpen(true);
    }
  });

  const handleDialogClose = () => {
    setAssignDialogOpen(false);
    setSelectedFileId(null);
  };

  return (
    <>
      <Header title="Files" />

      <div className="flex items-center gap-2 mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="unannotated">
              <Fingerprint className="w-4 h-4" />
              Unannotated
            </TabsTrigger>
            <TabsTrigger value="unassigned">
              <TestTube className="w-4 h-4" />
              Unassigned
            </TabsTrigger>
            <TabsTrigger value="excluded">
              <X className="w-4 h-4" />
              Excluded
            </TabsTrigger>
            <TabsTrigger value="done">
              <CheckCircle className="w-4 h-4" />
              Done
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <FilesHelp />
      </div>

      <div className="flex gap-2 items-center mb-4">
        <Input placeholder="Search" />
        <FilesTypeDropdown
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
        <DateRangePicker
          placeholder="Run Date"
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <FilesTable
        fastqs={filteredFastqs}
        selectedFiles={selectedFiles}
        onFileSelect={handleFileSelect}
        onSelectAll={handleSelectAll}
      />

      <SelectionBar
        selectedCount={selectedCount}
        itemName="file"
        onClearSelection={clearSelection}
      >
        <FilesAnnotate selectedCount={selectedCount} />
        <FilesAssign selectedCount={selectedCount} />
        <Button onClick={() => setExcludeDialogOpen(true)} variant="outline">
          Exclude <Kbd shortcut="E" />
        </Button>
      </SelectionBar>
    </>
  );
}
