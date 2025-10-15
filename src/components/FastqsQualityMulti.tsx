import { FastqsQualitySelect } from "@/components/FastqsQualitySelect";
import { FastqsSummary } from "@/components/FastqsSummary.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import { useMultiEditDialogState } from "@/hooks/useMultiEditDialogState.tsx";
import { useMultiSelectHotkey } from "@/hooks/useMultiSelectHotkey.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { FastqQuality } from "@/lib/quality.ts";
import type { Fastq, FastqUpdate } from "@/types.ts";
import { useState } from "react";

export function FastqsQualityMulti() {
  const [open, setOpen] = useMultiEditDialogState();
  const [quality, setQuality] = useState<FastqQuality | null>(null);
  const { selectedItems } = useSelection<Fastq>();
  const { batchUpdateAsync } = usePocketBaseBatchUpdate<FastqUpdate>("fastqs");

  useMultiSelectHotkey("q", selectedItems, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          Quality <Kbd shortcut="Q" variant="subtle" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Quality</DialogTitle>
          <DialogDescription>
            Set the quality rating for all selected FASTQ files.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <FastqsQualitySelect
            value={quality}
            onValueChange={async (value) => {
              setQuality(value);
              const updates = selectedItems.map((fastq) => ({
                id: fastq.id,
                data: {
                  quality: value as FastqQuality,
                },
              }));
              await batchUpdateAsync({ updates });
            }}
          />

          <FastqsSummary
            selectedItems={selectedItems}
            fieldExtractor={(fastq) => fastq.quality}
            fieldValueFormatter={(value) => (value ? `${value}` : "Unset")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
