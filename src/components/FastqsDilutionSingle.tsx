import { FastqsDilutionSelect } from "@/components/FastqsDilutionSelect.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { FastqDilution } from "@/lib/dilution.ts";
import type { Fastq } from "@/types";
import React from "react";

type FastqsDilutionSingleProps = {
  fastq: Fastq | null;
  trigger: React.ReactNode;
};

export function FastqsDilutionSingle({
  fastq,
  trigger,
}: FastqsDilutionSingleProps) {
  const [dilutionValue, setDilutionValue] =
    React.useState<FastqDilution | null>(null);
  const [open, setOpen] = React.useState(false);

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  // Initialize dilution value when fastq changes
  React.useEffect(() => {
    if (fastq) {
      setDilutionValue(fastq.dilution || null);
    }
  }, [fastq]);

  function handleValueChange(value: FastqDilution | null) {
    if (!fastq) return;

    setDilutionValue(value);
    setOpen(false);

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dilution Factor</h4>
            <p className="text-sm text-muted-foreground">
              Set dilution factor for <strong>{fastq?.name}</strong>
            </p>
          </div>
          <FastqsDilutionSelect
            value={dilutionValue}
            onValueChange={handleValueChange}
            label="Dilution Factor"
            disabled={isUpdating}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
