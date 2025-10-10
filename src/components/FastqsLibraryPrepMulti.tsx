import { FastqsLibraryPrepSelect } from "@/components/FastqsLibraryPrepSelect.tsx";
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
import { Label } from "@/components/ui/label.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import { getCommonValue } from "@/lib/utils.ts";
import type { Fastq, FastqLibraryPrep } from "@/types.ts";
import { useState } from "react";
import { useMultiSelectHotkey } from "@/hooks/useMultiSelectHotkey.tsx";

export function FastqsLibraryPrepMulti() {
  const [open, setOpen] = useState(false);
  const { selectedItems } = useSelection<Fastq>();
  const { batchUpdate } = usePocketBaseBatchUpdate<Fastq>("fastqs");

  useMultiSelectHotkey("l", selectedItems, setOpen);

  const currentValue = getCommonValue(selectedItems, "library_prep");

  function handleChange(value: FastqLibraryPrep | null) {
    batchUpdate({
      updates: selectedItems.map((fastq) => ({
        id: fastq.id,
        data: { library_prep: value },
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          Library Prep <Kbd shortcut="L" variant="subtle" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set Library Prep</DialogTitle>
          <DialogDescription>
            Set the library prep for all selected FASTQ files.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="font-semibold">
              Set library prep for all selected FASTQs:
            </Label>
            <div className="mt-3">
              <FastqsLibraryPrepSelect
                value={currentValue}
                onSelect={handleChange}
              />
            </div>
          </div>

          <FastqsSummary
            selectedItems={selectedItems}
            fieldExtractor={(fastq) => fastq.library_prep}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
