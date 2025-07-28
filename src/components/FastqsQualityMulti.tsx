import { FastqsAnnotateSelection } from "@/components/FastqsAnnotateSelection.tsx";
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
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq, FastqUpdate } from "@/types.ts";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function FastqsQualityMulti() {
  const [open, setOpen] = useState(false);
  const { selectedItems } = useSelection<Fastq>();
  const { batchUpdateAsync } = usePocketBaseBatchUpdate<FastqUpdate>("fastqs");

  useHotkeys(
    "q",
    () => {
      if (selectedItems.length > 0) {
        setOpen(true);
      }
    },
    {
      enabled: selectedItems.length > 0,
      preventDefault: true,
      enableOnFormTags: true,
    },
  );

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
          <div>
            <Label className="font-semibold">
              Set quality for all selected FASTQs:
            </Label>
            <div className="mt-3 flex gap-2">
              {["1", "2", "3", "4", "5"].map((quality) => (
                <Button
                  key={quality}
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    const updates = selectedItems.map((fastq) => ({
                      id: fastq.id,
                      data: {
                        quality: quality as import("@/types.ts").FastqQuality,
                      },
                    }));
                    console.log({ updates });
                    await batchUpdateAsync({ updates });
                  }}
                  className="min-w-[40px]"
                >
                  {quality}
                </Button>
              ))}
              <UnsetButton
                onUnset={async () => {
                  try {
                    const updates = selectedItems.map((fastq) => ({
                      id: fastq.id,
                      data: { quality: null },
                    }));
                    console.log("Batch updating quality to null:", updates);
                    await batchUpdateAsync({ updates });
                    console.log("Batch update completed");
                  } catch (error) {
                    console.error("Batch update failed:", error);
                  }
                }}
              />
            </div>
          </div>

          <FastqsAnnotateSelection
            selectedItems={selectedItems}
            fieldExtractor={(fastq) => fastq.quality}
            fieldValueFormatter={(value) => (value ? `${value}` : "Unset")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
