import { FastqsSampleSelector } from "@/components/FastqsSampleSelector.tsx";
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
import { UnsetButton } from "@/components/ui/unset.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq } from "@/types.ts";
import { useState } from "react";
import { useMultiSelectHotkey } from "@/hooks/useMultiSelectHotkey.tsx";

export function FastqsSampleMulti() {
  const [open, setOpen] = useState(false);
  const { selectedItems } = useSelection<Fastq>();
  const { update } = usePocketBaseMutation<any>("fastqs");
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  useMultiSelectHotkey("s", selectedItems, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          Sample <Kbd shortcut="S" variant="subtle" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Sample</DialogTitle>
          <DialogDescription>
            Assign a sample to all selected FASTQ files.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-3">
            <Label className="font-semibold">
              Set sample for all selected FASTQs
            </Label>
            <FastqsSampleSelector
              value={selectedSampleId}
              onChange={(sampleId) => {
                setSelectedSampleId(sampleId);
                if (sampleId) {
                  const updates = selectedItems.map((fastq) =>
                    update({
                      id: fastq.id,
                      data: { sample: sampleId },
                    }),
                  );
                  Promise.all(updates);
                }
              }}
              placeholder="Select or create a sample..."
              fastqNames={selectedItems.map((fastq) => fastq.name)}
            />
            <UnsetButton
              onUnset={async () => {
                const updates = selectedItems.map((fastq) =>
                  update({
                    id: fastq.id,
                    data: { sample: null },
                  }),
                );
                await Promise.all(updates);
                setSelectedSampleId(null);
              }}
            />
          </div>

          <FastqsSummary
            selectedItems={selectedItems}
            fieldExtractor={(fastq) => fastq.sample}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
