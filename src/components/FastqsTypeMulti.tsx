import { FastqsAnnotateSelection } from "@/components/FastqsAnnotateSelection.tsx";
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
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq, FastqType } from "@/types.ts";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function FastqsTypeMulti() {
  const [open, setOpen] = useState(false);
  const { selectedItems } = useSelection<Fastq>();
  const { update } = usePocketBaseMutation<any>("fastqs");

  useHotkeys(
    "t",
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
              <FastqsTypeSelect
                onValueChange={async (value: FastqType) => {
                  const updates = selectedItems.map((fastq) =>
                    update({ id: fastq.id, data: { type: value } }),
                  );
                  await Promise.all(updates);
                }}
                onUnset={async () => {
                  const updates = selectedItems.map((fastq) =>
                    update({ id: fastq.id, data: { type: null } }),
                  );
                  await Promise.all(updates);
                }}
              />
            </div>
          </div>

          <FastqsAnnotateSelection
            selectedItems={selectedItems}
            fieldExtractor={(fastq) => fastq.type}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
