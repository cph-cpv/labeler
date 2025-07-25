import { FastqsDilution } from "@/components/FastqsDilution.tsx";
import { FastqsExcludeSingle } from "@/components/FastqsExcludeSingle.tsx";
import { FastqsQualitySingle } from "@/components/FastqsQualitySingle.tsx";
import { FastqsSample } from "@/components/FastqsSample.tsx";
import { FastqsTypeSingle } from "@/components/FastqsTypeSingle.tsx";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSelection } from "@/hooks/useSelection.tsx";
import { formatDilution } from "@/lib/dilution.ts";
import { formatDate } from "@/lib/utils.ts";
import type { Fastq } from "@/types.ts";
import { EditIcon, EyeOffIcon } from "lucide-react";
import React from "react";

type FastqsTableProps = {
  fastqs: Fastq[];
};

export function FastqsTable({ fastqs }: FastqsTableProps) {
  const { selectedIds, onToggle, onSelectAll, isAllSelected, onSetItems } =
    useSelection<Fastq>();

  const [editingSampleFastq, setEditingSampleFastq] =
    React.useState<Fastq | null>(null);
  const [editingTypeFastq, setEditingTypeFastq] = React.useState<Fastq | null>(
    null,
  );
  const [editingQualityFastqId, setEditingQualityFastqId] = React.useState<
    string | null
  >(null);
  const [editingDilutionFastq, setEditingDilutionFastq] =
    React.useState<Fastq | null>(null);
  const [excludingFastq, setExcludingFastq] = React.useState<Fastq | null>(
    null,
  );

  // Update items when fastqs change
  React.useEffect(() => {
    onSetItems(fastqs);
  }, [fastqs, onSetItems]);

  function handleSampleClick(fastq: Fastq) {
    setEditingSampleFastq(fastq);
  }

  function handleSampleKeyDown(event: React.KeyboardEvent, fastq: Fastq) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingSampleFastq(fastq);
    }
  }

  function handleTypeClick(fastq: Fastq) {
    setEditingTypeFastq(fastq);
  }

  function handleTypeKeyDown(event: React.KeyboardEvent, fastq: Fastq) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingTypeFastq(fastq);
    }
  }

  function handleQualityClick(fastq: Fastq) {
    setEditingQualityFastqId(fastq.id);
  }

  function handleQualityKeyDown(event: React.KeyboardEvent, fastq: Fastq) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingQualityFastqId(fastq.id);
    }
  }

  function handleDilutionClick(fastq: Fastq) {
    setEditingDilutionFastq(fastq);
  }

  function handleDilutionKeyDown(event: React.KeyboardEvent, fastq: Fastq) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingDilutionFastq(fastq);
    }
  }

  function handleSampleDialogClose() {
    setEditingSampleFastq(null);
  }

  function handleTypeDialogClose() {
    setEditingTypeFastq(null);
  }

  function handleQualityDialogClose() {
    setEditingQualityFastqId(null);
  }

  function handleDilutionDialogClose() {
    setEditingDilutionFastq(null);
  }

  function handleExcludeClick(fastq: Fastq) {
    setExcludingFastq(fastq);
  }

  function handleExcludeDialogClose() {
    setExcludingFastq(null);
  }

  return (
    <>
      <Table className="table">
        <TableCaption>All available FASTQs.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <SelectAllCheckbox
                items={fastqs}
                isAllSelected={isAllSelected}
                onSelectAll={onSelectAll}
              />
            </TableHead>
            <TableHead className="flex-[2]">Name</TableHead>
            <TableHead className="w-32">Run Date</TableHead>
            <TableHead className="w-20">Type</TableHead>
            <TableHead className="w-24">Quality</TableHead>
            <TableHead className="w-24">Dilution</TableHead>
            <TableHead className="flex-1">Sample</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fastqs.map((fastq) => (
            <TableRow key={fastq.id} className="hover:bg-transparent">
              <TableCell>
                <SelectionCheckbox
                  item={fastq}
                  selectedItems={selectedIds}
                  onItemSelect={(_, event) => onToggle(fastq.id, event)}
                  getItemLabel={(item) => item.name}
                />
              </TableCell>
              <TableCell>{fastq.name}</TableCell>
              <TableCell>
                <span>{formatDate(fastq.timestamp)}</span>
              </TableCell>
              <TableCell>
                <div
                  className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1 -mx-2 -my-1"
                  tabIndex={0}
                  role="button"
                  aria-label={`Edit type assignment for ${fastq.name}. Current type: ${
                    fastq.type || "Unknown"
                  }`}
                  onClick={() => handleTypeClick(fastq)}
                  onKeyDown={(e) => handleTypeKeyDown(e, fastq)}
                >
                  <div className="flex items-center justify-between">
                    <span>{fastq.type || <TableMissingIcon />}</span>
                    <EditIcon className="h-3 w-3 opacity-0 group-hover:opacity-70 group-focus:opacity-70 transition-opacity ml-2 flex-shrink-0" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div
                  className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1 -mx-2 -my-1"
                  tabIndex={0}
                  role="button"
                  aria-label={`Edit quality rating for ${fastq.name}. Current quality: ${
                    fastq.quality ? `${fastq.quality}/5` : "Unknown"
                  }`}
                  onClick={() => handleQualityClick(fastq)}
                  onKeyDown={(e) => handleQualityKeyDown(e, fastq)}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {fastq.quality ? (
                        `${fastq.quality}/5`
                      ) : (
                        <TableMissingIcon />
                      )}
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
                  aria-label={`Edit dilution factor for ${fastq.name}. Current dilution: ${
                    fastq.dilution ? `${fastq.dilution}x` : "Unknown"
                  }`}
                  onClick={() => handleDilutionClick(fastq)}
                  onKeyDown={(e) => handleDilutionKeyDown(e, fastq)}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {fastq.dilution ? (
                        `${formatDilution(fastq.dilution)}`
                      ) : (
                        <TableMissingIcon />
                      )}
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
                  aria-label={`Edit sample assignment for ${fastq.name}. Current sample: ${
                    fastq.sample || "Unassigned"
                  }`}
                  onClick={() => handleSampleClick(fastq)}
                  onKeyDown={(e) => handleSampleKeyDown(e, fastq)}
                >
                  <div className="flex items-center justify-between">
                    <span>{fastq.sample || <TableMissingIcon />}</span>
                    <EditIcon className="h-3 w-3 opacity-0 group-hover:opacity-70 group-focus:opacity-70 transition-opacity ml-2 flex-shrink-0" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcludeClick(fastq)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <EyeOffIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Exclude</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <FastqsSample
        fastq={editingSampleFastq}
        isOpen={editingSampleFastq !== null}
        onClose={handleSampleDialogClose}
      />

      <FastqsTypeSingle
        fastq={editingTypeFastq}
        isOpen={editingTypeFastq !== null}
        onClose={handleTypeDialogClose}
      />

      <FastqsQualitySingle
        fastqs={fastqs}
        fastqId={editingQualityFastqId}
        isOpen={editingQualityFastqId !== null}
        onClose={handleQualityDialogClose}
      />

      <FastqsDilution
        fastq={editingDilutionFastq}
        isOpen={editingDilutionFastq !== null}
        onClose={handleDilutionDialogClose}
      />

      <FastqsExcludeSingle
        fastq={excludingFastq}
        isOpen={excludingFastq !== null}
        onClose={handleExcludeDialogClose}
      />
    </>
  );
}
