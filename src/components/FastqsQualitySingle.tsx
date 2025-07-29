import { FastqsQualitySelect } from "@/components/FastqsQualitySelect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { FastqQuality } from "@/lib/quality.ts";
import type { Fastq } from "@/types";
import React from "react";

type FastqsQualitySingleProps = {
  fastq: Fastq | null;
  trigger: React.ReactNode;
};

export function FastqsQualitySingle({
  fastq,
  trigger,
}: FastqsQualitySingleProps) {
  const [selectedQuality, setSelectedQuality] = React.useState<number | null>(
    null,
  );
  const [open, setOpen] = React.useState(false);

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  // Update selected quality when fastq changes
  React.useEffect(() => {
    if (fastq) {
      setSelectedQuality(fastq.quality ? parseInt(fastq.quality) : null);
    }
  }, [fastq]);

  // Memoize the handleQualityChange to prevent re-creation
  const handleQualityChange = React.useCallback(
    (newQuality: number | null) => {
      setSelectedQuality(newQuality);
      setOpen(false);
      if (fastq) {
        update(
          {
            id: fastq.id,
            data: {
              quality: newQuality
                ? (newQuality.toString() as FastqQuality)
                : null,
            },
          },
          {
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Quality Rating</h4>
            <p className="text-sm text-muted-foreground">
              Set quality rating for <strong>{fastq?.name}</strong>
            </p>
          </div>
          <FastqsQualitySelect
            disabled={isUpdating}
            onValueChange={handleQualityChange}
            value={selectedQuality}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
