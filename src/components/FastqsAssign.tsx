import { FastqsSampleCombobox } from "@/components/FastqsSampleCombobox.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import { useSelectionContext } from "@/contexts/SelectionContext.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, Sample } from "@/types.ts";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function FastqsAssign() {
  const { selectedItems: selectedFastqs, clearSelection } =
    useSelectionContext<Fastq>();
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [open, setOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const { batchUpdate, isBatchUpdating } = usePocketBaseBatchUpdate("fastqs");

  useHotkeys(
    "s",
    () => {
      setOpen(true);
    },
    {
      enableOnFormTags: true,
      enabled: selectedFastqs.length > 0,
    },
  );

  const handleAssign = async () => {
    if (!selectedSample || selectedFastqs.length === 0) return;

    setIsAssigning(true);

    batchUpdate(
      {
        updates: selectedFastqs.map((fastq) => ({
          id: fastq.id,
          data: { sample: selectedSample.id },
        })),
      },
      {
        onSuccess: () => {
          // Clear selection and close dialog
          clearSelection();
          setOpen(false);
          setSelectedSample(null);
          setIsAssigning(false);
        },
        onError: (error) => {
          console.error("Failed to assign FASTQs to sample:", error);
          setIsAssigning(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          Assign <Kbd shortcut="S" variant="invert" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign FASTQs</DialogTitle>
          <DialogDescription>
            Assign a sample for the {selectedFastqs.length} selected FASTQ{" "}
            {selectedFastqs.length === 1 ? "FASTQ" : "FASTQs"}.
          </DialogDescription>
        </DialogHeader>
        <FastqsSampleCombobox
          value={selectedSample}
          onValueChange={setSelectedSample}
        />
        <div className="mb-4" />
        <DialogFooter>
          <Button
            onClick={handleAssign}
            disabled={!selectedSample || isAssigning || isBatchUpdating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAssigning || isBatchUpdating ? "Assigning..." : "Assign FASTQs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
