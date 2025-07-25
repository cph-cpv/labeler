import { FastqsQualitySlider } from "@/components/FastqsQualitySlider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq } from "@/types";
import { VisuallyHidden } from "radix-ui";
import React from "react";

type FastqsQualitySingleProps = {
  fastqs: Fastq[];
  fastqId: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export function FastqsQualitySingle({
  fastqs,
  fastqId,
  isOpen,
  onClose,
}: FastqsQualitySingleProps) {
  const [selectedQuality, setSelectedQuality] = React.useState<number>(1);

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  const fastq = React.useMemo(
    () => fastqs.find((f) => f.id === fastqId) || null,
    [fastqs, fastqId],
  );

  // Update selected quality when dialog opens with a new fastq
  React.useEffect(() => {
    if (fastq && isOpen) {
      setSelectedQuality(fastq.quality || 1);
    }
  }, [fastqId, isOpen]);

  // Memoize the handleQualityChange to prevent slider re-creation
  const handleQualityChange = React.useCallback(
    (newQuality: number) => {
      setSelectedQuality(newQuality);
      if (fastq) {
        update(
          { id: fastq.id, data: { quality: newQuality } },
          {
            onSuccess: () => {
              // Keep dialog open for multiple edits
            },
            onError: (error) => {
              console.error("Failed to update quality:", error);
            },
          },
        );
      }
    },
    [fastq, update],
  );

  if (!fastq) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>Edit Quality Rating</DialogTitle>
            <DialogDescription>
              Set quality rating for <strong>{fastq.name}</strong>
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden.Root>

        <div className="space-y-4">
          <FastqsQualitySlider
            value={selectedQuality}
            onValueChange={handleQualityChange}
            disabled={isUpdating}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
