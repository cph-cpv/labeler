import { FastqsLibraryPrepSelect } from "@/components/FastqsLibraryPrepSelect.tsx";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, FastqLibraryPrep } from "@/types";
import React from "react";

type FastqsLibraryPrepSingleProps = {
  fastq: Fastq | null;
  trigger: React.ReactNode;
};

export function FastqsLibraryPrepSingle({
  fastq,
  trigger,
}: FastqsLibraryPrepSingleProps) {
  const [selectedLibraryPrep, setSelectedLibraryPrep] =
    React.useState<FastqLibraryPrep | null>(null);
  const [open, setOpen] = React.useState(false);

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  React.useEffect(() => {
    if (fastq) {
      setSelectedLibraryPrep(fastq.library_prep || null);
    }
  }, [fastq]);

  function handleSelect(value: FastqLibraryPrep | null) {
    setSelectedLibraryPrep(value);
    setOpen(false);

    if (fastq) {
      update(
        { id: fastq.id, data: { library_prep: value } },
        {
          onError: (error) => {
            console.error("Failed to update library prep:", error);
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
            <h4 className="font-medium leading-none">Library Prep Assignment</h4>
            <p className="text-sm text-muted-foreground">
              Assign a library prep to <strong>{fastq?.name}</strong>
            </p>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Library Prep</Label>
            <FastqsLibraryPrepSelect
              value={selectedLibraryPrep}
              onSelect={handleSelect}
              disabled={isUpdating}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
