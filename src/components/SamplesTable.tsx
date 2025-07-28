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
import { UnsetIcon } from "@/components/ui/unset.tsx";
import type { Sample } from "@/types.ts";
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
            <TableCellEditable
              onClick={() => onNameClick(sample)}
              onKeyDown={(e) => onNameKeyDown(e, sample)}
              ariaLabel={`Edit name for sample: ${sample.name}`}
            >
              <span className="font-medium">{sample.name}</span>
            </TableCellEditable>
            <TableCellEditable
              onClick={() => onFastqsClick(sample)}
              onKeyDown={(e) => onFastqsKeyDown(e, sample)}
              ariaLabel={`Edit FASTQs for ${sample.name}. Currently has ${getFastqCount(sample.id)} FASTQs assigned`}
            >
              {(() => {
                const count = getFastqCount(sample.id);
                return count ? (
                  `${count} FASTQ${count === 1 ? "" : "s"}`
                ) : (
                  <UnsetIcon />
                );
              })()}
            </TableCellEditable>
            <TableCellEditable
              onClick={() => onVirusesClick(sample)}
              onKeyDown={(e) => onVirusesKeyDown(e, sample)}
              ariaLabel={`Edit virus labels for ${sample.name}. Currently has ${sample.viruses?.length || 0} viruses assigned`}
            >
              {sample.viruses?.length ? (
                `${sample.viruses.length} virus${sample.viruses.length === 1 ? "" : "es"}`
              ) : (
                <UnsetIcon />
              )}
            </TableCellEditable>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
