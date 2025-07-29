import { FastqsTypeSelect } from "@/components/FastqsTypeSelect";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, FastqType } from "@/types";
import React from "react";

type FastqsTypeSingleProps = {
  fastq: Fastq | null;
  trigger: React.ReactNode;
};

export function FastqsTypeSingle({ fastq, trigger }: FastqsTypeSingleProps) {
  const [selectedType, setSelectedType] = React.useState<FastqType | null>(
    null,
  );
  const [open, setOpen] = React.useState(false);

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  React.useEffect(() => {
    if (fastq) {
      setSelectedType(fastq.type || null);
    }
  }, [fastq]);

  function handleSelect(value: FastqType | null) {
    setSelectedType(value);
    setOpen(false);

    if (fastq) {
      update(
        { id: fastq.id, data: { type: value } },
        {
          onError: (error) => {
            console.error("Failed to update type:", error);
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
            <h4 className="font-medium leading-none">Type Assignment</h4>
            <p className="text-sm text-muted-foreground">
              Assign a type to <strong>{fastq?.name}</strong>
            </p>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type</Label>
            <FastqsTypeSelect
              value={selectedType}
              onSelect={handleSelect}
              disabled={isUpdating}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
