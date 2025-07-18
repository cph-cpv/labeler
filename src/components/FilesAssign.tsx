import { FilesSampleCombobox } from "@/components/FilesSampleCombobox.tsx";
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
import { pb } from "@/lib/pocketbase.ts";
import type { Fastq, Sample } from "@/types.ts";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface AssignProps {
  selectedCount: number;
  onAssignmentComplete?: () => void;
}

export function FilesAssign({
  selectedCount,
  onAssignmentComplete,
}: AssignProps) {
  const { selectedItems: selectedFiles, clearSelection } =
    useSelectionContext<Fastq>();
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [open, setOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useHotkeys("s", () => {
    setOpen(true);
  });

  const handleAssign = async () => {
    if (!selectedSample || selectedFiles.length === 0) return;

    setIsAssigning(true);
    try {
      // Update all selected files with the chosen sample
      await Promise.all(
        selectedFiles.map((file) =>
          pb.collection("files").update(file.id, {
            sample: selectedSample.id,
          }),
        ),
      );

      // Clear selection and close dialog
      clearSelection();
      setOpen(false);
      setSelectedSample(null);

      // Notify parent component if callback provided
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }
    } catch (error) {
      console.error("Failed to assign files to sample:", error);
    } finally {
      setIsAssigning(false);
    }
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
          <DialogTitle>Assign Files</DialogTitle>
          <DialogDescription>
            Assign a sample for the {selectedCount} selected FASTQ{" "}
            {selectedCount === 1 ? "file" : "files"}.
          </DialogDescription>
        </DialogHeader>
        <FilesSampleCombobox
          value={selectedSample}
          onValueChange={setSelectedSample}
        />
        <DialogFooter>
          <Button
            onClick={handleAssign}
            disabled={!selectedSample || isAssigning}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAssigning ? "Assigning..." : "Assign Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
