import { FastqsExtractionSelect } from "@/components/FastqsExtractionSelect.tsx";
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
import { useMultiEditDialogState } from "@/hooks/useMultiEditDialogState.tsx";
import { useMultiSelectHotkey } from "@/hooks/useMultiSelectHotkey.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import { getCommonValue } from "@/lib/utils.ts";
import type { Fastq, FastqExtraction } from "@/types.ts";

export function FastqsExtractionMulti() {
  const [open, setOpen] = useMultiEditDialogState();
  const { selectedItems } = useSelection<Fastq>();
  const { batchUpdate } = usePocketBaseBatchUpdate<Fastq>("fastqs");

  useMultiSelectHotkey("e", selectedItems, setOpen);

  const currentValue = getCommonValue(selectedItems, "extraction");

  function handleChange(value: FastqExtraction | null) {
    batchUpdate({
      updates: selectedItems.map((fastq) => ({
        id: fastq.id,
        data: { extraction: value },
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          Extraction <Kbd shortcut="E" variant="subtle" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set Extraction</DialogTitle>
          <DialogDescription>
            Set the extraction for all selected FASTQ files.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="font-semibold">
              Set extraction for all selected FASTQs:
            </Label>
            <div className="mt-3">
              <FastqsExtractionSelect
                value={currentValue}
                onSelect={handleChange}
              />
            </div>
          </div>

          <FastqsSummary
            selectedItems={selectedItems}
            fieldExtractor={(fastq) => fastq.extraction}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
