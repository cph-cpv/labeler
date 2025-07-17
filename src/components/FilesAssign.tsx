import { FilesSampleCombobox } from "@/components/FilesSampleCombobox.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import { useSelectionContext } from "@/contexts/SelectionContext.tsx";
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
  const { selectedItems: selectedFiles } = useSelectionContext<Fastq>();
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [open, setOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useHotkeys("s", () => {
    setOpen(true);
  });

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
        <FilesSampleCombobox onValueChange={setSelectedSample} />
      </DialogContent>
    </Dialog>
  );
}
