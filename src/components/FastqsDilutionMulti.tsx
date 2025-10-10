import { FastqsDilutionSelect } from "@/components/FastqsDilutionSelect.tsx";
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
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import { getCommonValue } from "@/lib/utils.ts";
import type { Fastq } from "@/types.ts";
import { useState } from "react";
import { useMultiSelectHotkey } from "@/hooks/useMultiSelectHotkey.tsx";

export function FastqsDilutionMulti() {
  const [open, setOpen] = useState(false);
  const { selectedItems } = useSelection<Fastq>();
  const { batchUpdateAsync } = usePocketBaseBatchUpdate<Fastq>("fastqs");

  const currentValue = getCommonValue(selectedItems, "dilution");

  useMultiSelectHotkey("d", selectedItems, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          Dilution <Kbd shortcut="D" variant="subtle" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dilution Factor</DialogTitle>
          <DialogDescription>
            Set the dilution factor for all selected FASTQ files.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <FastqsDilutionSelect
            value={currentValue}
            label="Set dilution factor for all selected FASTQs:"
            onValueChange={async (dilution) => {
              const updates = selectedItems.map((fastq) => ({
                id: fastq.id,
                data: { dilution },
              }));
              await batchUpdateAsync({ updates });
            }}
          />

          <FastqsSummary
            selectedItems={selectedItems}
            fieldExtractor={(fastq) =>
              fastq.dilution !== null ? fastq.dilution : "Unset"
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
