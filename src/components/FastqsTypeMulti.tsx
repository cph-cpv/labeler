import { FastqsSummary } from "@/components/FastqsSummary.tsx";
import { FastqsTypeSelect } from "@/components/FastqsTypeSelect.tsx";
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
import { Label } from "@/components/ui/label.tsx";
import { useMultiSelectHotkey } from "@/hooks/useMultiSelectHotkey.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import { getCommonValue } from "@/lib/utils.ts";
import type { Fastq, FastqType } from "@/types.ts";
import { useState } from "react";

export function FastqsTypeMulti() {
  const [open, setOpen] = useState(false);
  const { selectedItems } = useSelection<Fastq>();
  const { batchUpdate } = usePocketBaseBatchUpdate<Fastq>("fastqs");

  useMultiSelectHotkey("t", selectedItems, setOpen);

  const currentValue = getCommonValue(selectedItems, "type");

  function handleChange(value: FastqType | null) {
    batchUpdate({
      updates: selectedItems.map((fastq) => ({
        id: fastq.id,
        data: { type: value },
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          Type <Kbd shortcut="T" variant="subtle" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set Type</DialogTitle>
          <DialogDescription>
            Set the type for all selected FASTQ files.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="font-semibold">
              Set type for all selected FASTQs:
            </Label>
            <div className="mt-3">
              <FastqsTypeSelect value={currentValue} onSelect={handleChange} />
            </div>
          </div>

          <FastqsSummary
            selectedItems={selectedItems}
            fieldExtractor={(fastq) => fastq.type}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
