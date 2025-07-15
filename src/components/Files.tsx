import { FilesSelection } from "@/components/FilesSelection.tsx";
import { FilesTableAnnotated } from "@/components/FilesTableAnnotated.tsx";
import { FilesTableUnannotated } from "@/components/FilesTableUnannotated.tsx";
import { FilesTypeDropdown } from "@/components/FilesTypeDropdown.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DateRangePicker } from "@/components/ui/date-range.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Header } from "@/components/ui/header.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import type { Fastq } from "@/types.ts";
import data from "@fake/fastq.json";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

const fastqs: Fastq[] = data.map((datum) => {
  return {
    ...datum,
    timestamp: new Date(datum.timestamp),
  };
});

export function Files() {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [annotateDialogOpen, setAnnotateDialogOpen] = useState(false);
  const [excludeDialogOpen, setExcludeDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState("unannotated");

  const filteredFastqs = useMemo(() => {
    let filtered = fastqs;

    // Filter by tab selection
    if (activeTab === "excluded") {
      filtered = filtered.filter((fastq) => fastq.excluded);
    } else {
      // For unannotated and annotated tabs, show non-excluded files
      filtered = filtered.filter((fastq) => !fastq.excluded);
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
  }, [activeTab, dateRange]);

  const handleAssignClick = (fileId: string) => {
    setSelectedFileId(fileId);
    setAssignDialogOpen(true);
  };

  const handleDialogClose = () => {
    setAssignDialogOpen(false);
    setSelectedFileId(null);
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFastqs.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFastqs.map((f) => f.id.toString())));
    }
  };

  return (
    <>
      <Header title="Files" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="unannotated">Unannotated</TabsTrigger>
          <TabsTrigger value="annotated">Annotated</TabsTrigger>
          <TabsTrigger value="excluded">Excluded</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2 items-center mb-4">
        <Input placeholder="Search" />
        <FilesTypeDropdown />
        <DateRangePicker
          placeholder="Run Date"
          value={dateRange}
          onChange={setDateRange}
        />

        <FilesSelection
          selectedCount={selectedFiles.size}
          onAnnotate={() => setAnnotateDialogOpen(true)}
          onExclude={() => setExcludeDialogOpen(true)}
        />
      </div>

      {activeTab === "annotated" ? (
        <FilesTableAnnotated
          fastqs={filteredFastqs}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onSelectAll={handleSelectAll}
        />
      ) : (
        <FilesTableUnannotated
          fastqs={filteredFastqs}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onSelectAll={handleSelectAll}
        />
      )}

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign FASTQ File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Assigning file with ID: {selectedFileId}</p>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
