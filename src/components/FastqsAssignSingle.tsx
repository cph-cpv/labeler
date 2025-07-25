import { FastqsSampleCombobox } from "@/components/FastqsSampleCombobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Fastq, Sample } from "@/types";
import React from "react";

type FastqsAssignSingleProps = {
  fastq: Fastq | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fastq: Fastq, sample: Sample | null) => void;
  isLoading?: boolean;
};

export function FastqsAssignSingle({
  fastq,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: FastqsAssignSingleProps) {
  const [selectedSample, setSelectedSample] = React.useState<Sample | null>(
    null,
  );

  // Initialize selected sample when dialog opens
  React.useEffect(() => {
    if (fastq && isOpen) {
      // If fastq has a sample string, we need to find the Sample object
      // For now, we'll create a mock Sample object if fastq.sample exists
      if (fastq.sample) {
        setSelectedSample({
          id: "", // We don't have the ID from the string
          name: fastq.sample,
        });
      } else {
        setSelectedSample(null);
      }
    }
  }, [fastq, isOpen]);

  function handleSave() {
    if (!fastq) return;
    onSave(fastq, selectedSample);
  }

  function handleCancel() {
    setSelectedSample(null);
    onClose();
  }

  if (!fastq) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Sample Assignment</DialogTitle>
          <DialogDescription>
            Assign a sample to <strong>{fastq.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sample</label>
            <FastqsSampleCombobox
              value={selectedSample}
              onValueChange={setSelectedSample}
              placeholder="Select or create a sample..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
