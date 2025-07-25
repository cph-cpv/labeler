import { FastqsSampleCombobox } from "@/components/FastqsSampleCombobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, Sample } from "@/types";
import { VisuallyHidden } from "radix-ui";
import React from "react";

type FastqsAssignSingleProps = {
  fastq: Fastq | null;
  isOpen: boolean;
  onClose: () => void;
};

export function FastqsAssignSingle({
  fastq,
  isOpen,
  onClose,
}: FastqsAssignSingleProps) {
  const [selectedSample, setSelectedSample] = React.useState<Sample | null>(
    null,
  );

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

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

  function handleSampleChange(sample: Sample | null) {
    setSelectedSample(sample);
    if (fastq) {
      update(
        { id: fastq.id, data: { sample: sample?.name || null } },
        {
          onSuccess: () => {
            // Keep dialog open for multiple edits
          },
          onError: (error) => {
            console.error("Failed to update sample:", error);
          },
        },
      );
    }
  }

  if (!fastq) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>Edit Sample Assignment</DialogTitle>
            <DialogDescription>
              Assign a sample to <strong>{fastq.name}</strong>
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden.Root>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sample</label>
            <FastqsSampleCombobox
              value={selectedSample}
              onValueChange={handleSampleChange}
              placeholder="Select or create a sample..."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
