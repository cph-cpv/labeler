import { FastqsDilutionSingle } from "@/components/FastqsDilutionSingle.tsx";
import { FastqsExcludeSingle } from "@/components/FastqsExcludeSingle.tsx";
import { FastqsQualityDot } from "@/components/FastqsQualityDot.tsx";
import { FastqsQualitySingle } from "@/components/FastqsQualitySingle.tsx";
import { FastqsSample } from "@/components/FastqsSample.tsx";
import { FastqsTypeSingle } from "@/components/FastqsTypeSingle.tsx";
import { Button } from "@/components/ui/button";
import {
  SelectAllCheckbox,
  SelectionCheckbox,
} from "@/components/ui/selection-checkbox.tsx";
import { TableCellEditable } from "@/components/ui/table-cell-editable.tsx";
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
import { UnsetIcon } from "@/components/ui/unset.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";
import { cn, formatDate } from "@/lib/utils.ts";
import type { Fastq } from "@/types.ts";
import { EyeOffIcon } from "lucide-react";
import React from "react";

type FastqsTableProps = {
  fastqs: Fastq[];
};

function getFilenameFromPath(path: string): string {
  return path.split("/").pop() || path;
}

export function FastqsTable({ fastqs }: FastqsTableProps) {
  const { selectedIds, onToggle, onSelectAll, isAllSelected, onSetItems } =
    useSelection<Fastq>();

  const [editingSampleFastq, setEditingSampleFastq] =
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

  function handleSampleDialogClose() {
    setEditingSampleFastq(null);
  }

  function handleExcludeClick(fastq: Fastq) {
    setExcludingFastq(fastq);
  }

  function handleExcludeDialogClose() {
    setExcludingFastq(null);
  }

  return (
    <>
      <Table className="table" data-testid="fastqs-table">
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
              <TableCell>{getFilenameFromPath(fastq.path)}</TableCell>
              <TableCell>
                <span>{formatDate(fastq.timestamp)}</span>
              </TableCell>
              <TableCell>
                <FastqsTypeSingle
                  fastq={fastq}
                  trigger={
                    <div
                      className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1 -mx-2 -my-1 min-h-8 flex items-center"
                      tabIndex={0}
                      role="button"
                      aria-label={`Edit type assignment for ${getFilenameFromPath(fastq.path)}. Current type: ${
                        fastq.type || "Unset"
                      }`}
                    >
                      {fastq.type || <UnsetIcon />}
                    </div>
                  }
                />
              </TableCell>
              <TableCell>
                <FastqsQualitySingle
                  fastq={fastq}
                  trigger={
                    <div
                      className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1 -mx-2 -my-1 min-h-8 flex items-center"
                      tabIndex={0}
                      role="button"
                      aria-label={`Edit quality rating for ${getFilenameFromPath(fastq.path)}. Current quality: ${
                        fastq.quality ? `${fastq.quality}` : "Unset"
                      }`}
                    >
                      {fastq.quality ? (
                        <>
                          <FastqsQualityDot quality={fastq.quality} />
                          {fastq.quality}
                        </>
                      ) : (
                        <UnsetIcon />
                      )}
                    </div>
                  }
                />
              </TableCell>
              <TableCell>
                <FastqsDilutionSingle
                  fastq={fastq}
                  trigger={
                    <div
                      className={cn(
                        "group relative cursor-pointer",
                        "transition-colors hover:bg-muted/70 focus:bg-muted/70",
                        "focus:outline-none rounded px-2 py-1 -mx-2 -my-1 min-h-8 flex items-center",
                      )}
                      tabIndex={0}
                      role="button"
                      aria-label={`Edit dilution factor for ${getFilenameFromPath(fastq.path)}. Current dilution: ${
                        fastq.dilution ? fastq.dilution : "Unset"
                      }`}
                    >
                      {fastq.dilution ? (
                        fastq.dilution
                      ) : (
                        <UnsetIcon />
                      )}
                    </div>
                  }
                />
              </TableCell>
              <TableCellEditable
                onClick={() => handleSampleClick(fastq)}
                onKeyDown={(e) => handleSampleKeyDown(e, fastq)}
                ariaLabel={`Edit sample assignment for ${getFilenameFromPath(fastq.path)}. Current sample: ${
                  fastq.sample || "Unassigned"
                }`}
              >
                {fastq.sample || <UnsetIcon />}
              </TableCellEditable>
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

      <FastqsExcludeSingle
        fastq={excludingFastq}
        isOpen={excludingFastq !== null}
        onClose={handleExcludeDialogClose}
      />
    </>
  );
}
