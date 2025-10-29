import { SampleName } from "@/components/SampleName.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { SelectionCheckbox } from "@/components/ui/selection-checkbox.tsx";
import { TableCell, TableRow } from "@/components/ui/table.tsx";
import { UnsetIcon } from "@/components/ui/unset.tsx";
import { useDeleteSample } from "@/hooks/useDeleteSample.ts";
import type { Sample } from "@/types.ts";
import { EditIcon, Trash2 } from "lucide-react";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { deleteSample, isDeleting } = useDeleteSample();

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

  function handleDelete() {
    deleteSample(sample.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    });
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
      <TableCell className="text-right">
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                sample{" "}
                <span className="font-semibold text-foreground">
                  {sample.name}
                </span>{" "}
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}
