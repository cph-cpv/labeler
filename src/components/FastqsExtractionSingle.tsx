import { FastqsExtractionSelect } from "@/components/FastqsExtractionSelect";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, FastqExtraction } from "@/types";
import React from "react";

type FastqsExtractionSingleProps = {
  fastq: Fastq | null;
  trigger: React.ReactNode;
};

export function FastqsExtractionSingle({
  fastq,
  trigger,
}: FastqsExtractionSingleProps) {
  const [selectedExtraction, setSelectedExtraction] =
    React.useState<FastqExtraction | null>(null);
  const [open, setOpen] = React.useState(false);

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  React.useEffect(() => {
    if (fastq) {
      setSelectedExtraction(fastq.extraction || null);
    }
  }, [fastq]);

  function handleSelect(value: FastqExtraction | null) {
    setSelectedExtraction(value);
    setOpen(false);

    if (fastq) {
      update(
        { id: fastq.id, data: { extraction: value } },
        {
          onError: (error) => {
            console.error("Failed to update extraction:", error);
          },
        },
      );
    }
  }

  if (!fastq) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Extraction Assignment</h4>
            <p className="text-sm text-muted-foreground">
              Assign a extraction to <strong>{fastq?.name}</strong>
            </p>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Extraction</Label>
            <FastqsExtractionSelect
              value={selectedExtraction}
              onSelect={handleSelect}
              disabled={isUpdating}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
