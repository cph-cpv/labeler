import { FilesAnnotate } from "@/components/FilesAnnotate.tsx";
import { FilesAssign } from "@/components/FilesAssign.tsx";
import { FilesExclude } from "@/components/FilesExclude.tsx";
import { FilesHelp } from "@/components/FilesHelp.tsx";
import { FilesTable } from "@/components/FilesTable.tsx";
import {
  FilesTypeDropdown,
  type TypeFilter,
} from "@/components/FilesTypeDropdown.tsx";
import { DateRangePicker } from "@/components/ui/date-range.tsx";
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
import { SelectionBar } from "@/components/ui/selection-bar.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { FilesProvider } from "@/contexts/FilesContext.tsx";
import {
  SelectionProvider,
  useSelectionContext,
} from "@/contexts/SelectionContext.tsx";
import { usePocketBasePaginated } from "@/hooks/usePocketBase.ts";
import type { Fastq, Sample } from "@/types.ts";
import { CheckCircle, Fingerprint, TestTube, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

// PocketBase file interface
interface PocketBaseFile {
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
    sample?: Sample;
  };
}

export function Files() {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [annotateDialogOpen, setAnnotateDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState("unannotated");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>({
    dsRNA: false,
    smRNA: false,
    unknown: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Build PocketBase filter expression
  const filter = useMemo(() => {
    const conditions: string[] = [];

    // Tab filtering
    if (activeTab === "unannotated") {
      // Missing one of type, quality, or dilution factor, and not excluded
      conditions.push(
        "(excluded = null || excluded = false) && (type = null || quality_rating = null || dilution_factor = null)",
      );
    } else if (activeTab === "unassigned") {
      // Not assigned to a sample, and not excluded
      conditions.push(
        "(excluded = null || excluded = false) && (sample = null || sample = '')",
      );
    } else if (activeTab === "excluded") {
      conditions.push("excluded = true");
    } else if (activeTab === "done") {
      // Has type, quality, dilution factor, and is assigned to a sample, and not excluded
      conditions.push(
        "(excluded = null || excluded = false) && type != null && quality_rating != null && dilution_factor != null && sample != null && sample != ''",
      );
    }

    // Type filtering
    const hasTypeFilters =
      typeFilter.dsRNA || typeFilter.smRNA || typeFilter.unknown;
    if (hasTypeFilters) {
      const typeConditions: string[] = [];
      if (typeFilter.dsRNA) typeConditions.push("type = 'dsRNA'");
      if (typeFilter.smRNA) typeConditions.push("type = 'smRNA'");
      if (typeFilter.unknown)
        typeConditions.push("(type = 'Unknown' || type = null)");
      conditions.push(`(${typeConditions.join(" || ")})`);
    }

    // Date range filtering
    if (dateRange?.from) {
      const fromDate = dateRange.from.toISOString();
      const toDate = (dateRange.to || dateRange.from).toISOString();
      conditions.push(`date >= '${fromDate}' && date <= '${toDate}'`);
    }

    return conditions.join(" && ");
  }, [activeTab, dateRange, typeFilter]);

  const {
    data: pbFiles,
    loading,
    error,
    totalPages,
    refetch,
  } = usePocketBasePaginated<PocketBaseFile>("files", {
    expand: "sample",
    page: currentPage,
    perPage: itemsPerPage,
    filter,
  });

  // Convert PocketBase files to UI format
  const fastqs: Fastq[] = useMemo(() => {
    return pbFiles.map((file) => ({
      id: file.id, // Use PocketBase string ID directly
      name: file.name,
      path: file.path,
      timestamp: file.date ? new Date(file.date) : new Date(),
      quality:
        file.quality_rating === "good"
          ? 5
          : file.quality_rating === "borderline"
            ? 3
            : file.quality_rating === "bad"
              ? 1
              : null,
      dilutionFactor: file.dilution_factor,
      type:
        file.type === "dsRNA"
          ? "dsRNA"
          : file.type === "smRNA"
            ? "smRNA"
            : file.type === "Unknown"
              ? "Unknown"
              : null,
      sample: file.expand?.sample?.name || null,
      excluded: file.excluded || false,
    }));
  }, [pbFiles]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [activeTab, dateRange, typeFilter]);

  if (error) {
    return (
      <>
        <Header title="Files" />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Error loading files: {error.message}
          </div>
        </div>
      </>
    );
  }

  const handleDialogClose = () => {
    setAssignDialogOpen(false);
    setSelectedFileId(null);
  };

  return (
    <FilesProvider refetchFiles={refetch}>
      <SelectionProvider items={fastqs}>
        <FilesContent
          fastqs={fastqs}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onRefetch={refetch}
          loading={loading}
        />
      </SelectionProvider>
    </FilesProvider>
  );
}

interface FilesContentProps {
  fastqs: Fastq[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (filter: TypeFilter) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onRefetch: () => void;
  loading: boolean;
}

function FilesContent({
  fastqs,
  totalPages,
  currentPage,
  setCurrentPage,
  activeTab,
  setActiveTab,
  typeFilter,
  setTypeFilter,
  dateRange,
  setDateRange,
  onRefetch,
  loading,
}: FilesContentProps) {
  const { selectedCount, clearSelection } = useSelectionContext<Fastq>();

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

        {loading && <LoadingIndicator />}
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

      <FilesTable fastqs={fastqs} />

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

      <SelectionBar
        selectedCount={selectedCount}
        itemName="file"
        onClearSelection={clearSelection}
      >
        <FilesAnnotate selectedCount={selectedCount} />
        <FilesAssign
          selectedCount={selectedCount}
          onAssignmentComplete={onRefetch}
        />
        <FilesExclude
          selectedCount={selectedCount}
          onExcludeComplete={onRefetch}
        />
      </SelectionBar>
    </>
  );
}
