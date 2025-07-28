import { FastqsTypeSelect } from "@/components/FastqsTypeSelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, FastqType } from "@/types";
import { VisuallyHidden } from "radix-ui";
import React from "react";

type FastqsTypeSingleProps = {
  fastq: Fastq | null;
  isOpen: boolean;
  onClose: () => void;
};

export function FastqsTypeSingle({
  fastq,
  isOpen,
  onClose,
}: FastqsTypeSingleProps) {
  const [selectedType, setSelectedType] = React.useState<FastqType | null>(
    null,
  );

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  // Initialize selected type when dialog opens
  React.useEffect(() => {
    if (fastq && isOpen) {
      setSelectedType(fastq.type || null);
    }
  }, [fastq, isOpen]);

  function handleTypeChange(value: FastqType) {
    setSelectedType(value);
    if (fastq) {
      update(
        { id: fastq.id, data: { type: value } },
        {
          onSuccess: () => {
            // Keep dialog open for multiple edits
          },
          onError: (error) => {
            console.error("Failed to update type:", error);
          },
        },
      );
    }
  }

  function handleUnset() {
    setSelectedType(null);
    if (fastq) {
      update(
        { id: fastq.id, data: { type: null } },
        {
          onSuccess: () => {
            // Keep dialog open for multiple edits
          },
          onError: (error) => {
            console.error("Failed to update type:", error);
          },
        },
      );
    }
  }

  if (!fastq) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <VisuallyHidden.Root>
            <DialogTitle>Edit Type Assignment</DialogTitle>
            <DialogDescription>
              Assign a type to <strong>{fastq.name}</strong>
            </DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type</Label>
            <FastqsTypeSelect
              value={selectedType}
              onValueChange={handleTypeChange}
              onUnset={handleUnset}
              disabled={isUpdating}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
