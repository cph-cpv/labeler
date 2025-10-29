
import { SampleName } from "@/components/SampleName.tsx";
import { TableCell, TableRow } from "@/components/ui/table.tsx";
import type { Sample } from "@/types.ts";
import { SelectionCheckbox } from "@/components/ui/selection-checkbox.tsx";
import { EditIcon } from "lucide-react";
import { UnsetIcon } from "@/components/ui/unset.tsx";
import React from "react";

interface SampleRowProps {
  sample: Sample;
  selectedIds: Set<string>;
  onToggle: (id: string, event: React.MouseEvent | React.KeyboardEvent) => void;
  setEditingFastqsSample: (sample: Sample) => void;
  setEditingVirusesSample: (sample: Sample) => void;
}

export function SampleRow({
  sample,
  selectedIds,
  onToggle,
  setEditingFastqsSample,
  setEditingVirusesSample,
}: SampleRowProps) {
  function handleFastqsClick() {
    setEditingFastqsSample(sample);
  }

  function handleFastqsKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingFastqsSample(sample);
    }
  }

  function handleVirusesClick() {
    setEditingVirusesSample(sample);
  }

  function handleVirusesKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditingVirusesSample(sample);
    }
  }

  return (
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
          aria-label={`Edit FASTQs for ${sample.name}. Currently has ${sample.fastqs.length} FASTQs assigned`}
          onClick={handleFastqsClick}
          onKeyDown={handleFastqsKeyDown}
        >
          <div className="flex items-center justify-between">
            <span>
              {(() => {
                const count = sample.fastqs.length;
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
          onClick={handleVirusesClick}
          onKeyDown={handleVirusesKeyDown}
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
  );
}
