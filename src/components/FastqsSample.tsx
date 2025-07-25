import { FastqsSampleSelector } from "@/components/FastqsSampleSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq } from "@/types";
import { VisuallyHidden } from "radix-ui";
import React from "react";

type FastqsAssignSingleProps = {
  fastq: Fastq | null;
  isOpen: boolean;
  onClose: () => void;
};

export function FastqsSample({
  fastq,
  isOpen,
  onClose,
}: FastqsAssignSingleProps) {
  const [selectedSampleId, setSelectedSampleId] = React.useState<string | null>(
    null,
  );

  const { update } = usePocketBaseMutation<Fastq>("fastqs");

  // Initialize selected sample when dialog opens
  React.useEffect(() => {
    if (fastq && isOpen) {
      // If fastq has a sample ID, use it directly
      setSelectedSampleId(fastq.sample || null);
    }
  }, [fastq, isOpen]);

  function handleSampleChange(sampleId: string | null) {
    setSelectedSampleId(sampleId);
    if (fastq) {
      update(
        { id: fastq.id, data: { sample: sampleId } },
        {
          onSuccess: () => {
            onClose();
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
            <Label className="text-sm font-medium">Sample</Label>
            <FastqsSampleSelector
              value={selectedSampleId}
              onChange={handleSampleChange}
              placeholder="Select or create a sample..."
              fastqNames={[fastq.name]}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
