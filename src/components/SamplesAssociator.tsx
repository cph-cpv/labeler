import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { usePocketBaseCollection } from "@/hooks/usePocketBaseQuery.ts";
import { convertPbToUiFastq } from "@/lib/convert.ts";
import type { Fastq } from "@/types.ts";
import { ArrowLeftRight, X } from "lucide-react";
import React from "react";

type SamplesAssociatorProps = {
  searchTerm: string;
  selectedFastqs: Fastq[];
  onSelectFastq: (fastq: Fastq) => void;
  onDeselectFastq: (fastqId: string) => void;
  blocked?: string;
  minSearchLength?: number;
  className?: string;
};

function FastqScrollArea({
  items,
  onItemClick,
  emptyStateText,
  showRemoveButton = false,
}: {
  items: Fastq[];
  onItemClick: (fastq: Fastq) => void;
  emptyStateText: string;
  showRemoveButton?: boolean;
}) {
  return (
    <ScrollArea className="border w-full h-72 rounded-md">
      {items.map((fastq) => (
        <div
          key={fastq.id}
          className={`p-2 text-sm border-b last:border-b-0 ${
            showRemoveButton
              ? "flex items-center justify-between"
              : "hover:bg-muted/50 cursor-pointer"
          }`}
          onClick={showRemoveButton ? undefined : () => onItemClick(fastq)}
        >
          <div className="font-medium">{fastq.name}</div>
          {showRemoveButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onItemClick(fastq)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove from selection</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      ))}
      {items.length === 0 && (
        <div className="p-2 text-sm text-muted-foreground text-center">
          {emptyStateText}
        </div>
      )}
      <ScrollBar />
    </ScrollArea>
  );
}

export function SamplesAssociator({
  searchTerm,
  selectedFastqs,
  onSelectFastq,
  onDeselectFastq,
  blocked,
  className,
}: SamplesAssociatorProps) {
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Debounce the search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch matching FASTQs - show all when empty, filter when searching
  const { data: pbFastqs = [], isLoading } = usePocketBaseCollection<Fastq>(
    "fastqs",
    debouncedSearch.length === 0
      ? {
          filter: `(sample = null || sample = '') && (excluded = null || excluded = false)`,
          sort: "name",
        }
      : {
          filter: `(name ~ "${debouncedSearch}" || path ~ "${debouncedSearch}") && (sample = null || sample = '') && (excluded = null || excluded = false)`,
          sort: "name",
        },
  );

  const allMatchingFastqs = pbFastqs
    .map((pbFile) => convertPbToUiFastq(pbFile))
    .filter(Boolean) as Fastq[];

  // Filter out already selected FASTQs
  const selectedIds = new Set(selectedFastqs.map((f) => f.id));
  const availableFastqs = allMatchingFastqs.filter(
    (fastq) => !selectedIds.has(fastq.id),
  );

  function handleSelectFastq(fastq: Fastq) {
    onSelectFastq(fastq);
  }

  function handleDeselectFastq(fastq: Fastq) {
    onDeselectFastq(fastq.id);
  }

  const showInputWall = blocked && selectedFastqs.length === 0;

  return (
    <div className={`h-80 ${className || ""}`}>
      {showInputWall ? (
        <div className="flex items-center justify-center h-full border rounded-md bg-muted/5">
          <p className="text-sm text-muted-foreground">{blocked}</p>
        </div>
      ) : (
        <div className="flex gap-2 items-stretch h-full">
          <div className="flex-1 space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Found FASTQs</Label>
                <Badge variant="secondary">{availableFastqs.length}</Badge>
              </div>
              <LoadingIndicator isLoading={isLoading} />
            </div>
            <FastqScrollArea
              items={availableFastqs}
              onItemClick={handleSelectFastq}
              emptyStateText={
                debouncedSearch.length === 0
                  ? "No available FASTQ files"
                  : "No available FASTQ files found"
              }
            />
          </div>
          <div className="flex items-center justify-center">
            <ArrowLeftRight className="size-4" />
          </div>
          <div className="flex-1 space-y-2 flex flex-col">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Selected FASTQs</Label>
              <Badge variant="secondary">{selectedFastqs.length}</Badge>
            </div>
            <FastqScrollArea
              items={selectedFastqs}
              onItemClick={handleDeselectFastq}
              emptyStateText="No files selected"
              showRemoveButton={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
