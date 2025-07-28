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
import type { Sample } from "@/types.ts";
import { EditIcon } from "lucide-react";
import React from "react";

type SamplesTableProps = {
  samples: Sample[];
  isAllSelected: boolean;
  onSelectAll: (items: Sample[], selectAll: boolean) => void;
  selectedIds: Set<string>;
  onToggle: (id: string, event: React.MouseEvent) => void;
  onNameClick: (sample: Sample) => void;
  onNameKeyDown: (event: React.KeyboardEvent, sample: Sample) => void;
  onFastqsClick: (sample: Sample) => void;
  onFastqsKeyDown: (event: React.KeyboardEvent, sample: Sample) => void;
  onVirusesClick: (sample: Sample) => void;
  onVirusesKeyDown: (event: React.KeyboardEvent, sample: Sample) => void;
  getFastqCount: (sampleId: string) => number;
};

export function SamplesTable({
  samples,
  isAllSelected,
  onSelectAll,
  selectedIds,
  onToggle,
  onNameClick,
  onNameKeyDown,
  onFastqsClick,
  onFastqsKeyDown,
  onVirusesClick,
  onVirusesKeyDown,
  getFastqCount,
}: SamplesTableProps) {
  return (
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
              <div
                className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1 -mx-2 -my-1"
                tabIndex={0}
                role="button"
                aria-label={`Edit name for sample: ${sample.name}`}
                onClick={() => onNameClick(sample)}
                onKeyDown={(e) => onNameKeyDown(e, sample)}
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
                onClick={() => onFastqsClick(sample)}
                onKeyDown={(e) => onFastqsKeyDown(e, sample)}
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
                onClick={() => onVirusesClick(sample)}
                onKeyDown={(e) => onVirusesKeyDown(e, sample)}
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
  );
}
