import { FastqsDilution } from "@/components/FastqsDilution.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { FastqDilution } from "@/lib/dilution.ts";
import type { Fastq } from "@/types";
import { VisuallyHidden } from "radix-ui";
import React from "react";

type FastqsDilutionSingleProps = {
  fastq: Fastq | null;
  isOpen: boolean;
  onClose: () => void;
};

export function FastqsDilutionSingle({
  fastq,
  isOpen,
  onClose,
}: FastqsDilutionSingleProps) {
  const [dilutionValue, setDilutionValue] =
    React.useState<FastqDilution | null>(null);

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  // Initialize dilution value when dialog opens
  React.useEffect(() => {
    if (fastq && isOpen) {
      setDilutionValue(fastq.dilution || null);
    }
  }, [fastq, isOpen]);

  function handleValueChange(value: FastqDilution | null) {
    if (!fastq) return;

    setDilutionValue(value);

    update(
      { id: fastq.id, data: { dilution: value } },
      {
        onError: (error) => {
          console.error("Failed to update dilution factor:", error);
        },
      },
    );
  }

  if (!fastq) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>Dilution Factor</DialogTitle>
            <DialogDescription>
              Set dilution factor for <strong>{fastq.name}</strong>
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden.Root>

        <div className="space-y-4">
          <FastqsDilution
            value={dilutionValue}
            onValueChange={handleValueChange}
            label="Dilution Factor"
            disabled={isUpdating}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
