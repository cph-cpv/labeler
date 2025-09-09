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
import { Switch } from "@/components/ui/switch.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import { getCommonValue } from "@/lib/utils.ts";
import type { Fastq } from "@/types.ts";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function FastqsRoboticPrepMulti() {
  const [open, setOpen] = useState(false);
  const { selectedItems } = useSelection<Fastq>();
  const { batchUpdate } = usePocketBaseBatchUpdate<Fastq>("fastqs");

  useHotkeys(
    "r",
    () => {
      if (selectedItems.length > 0) {
        setOpen(true);
      }
    },
    {
      enabled: selectedItems.length > 0,
      enableOnFormTags: true,
      preventDefault: true,
    },
  );

  const currentValue = getCommonValue(selectedItems, "robotic_prep");

  function handleChange(value: boolean) {
    batchUpdate({
      updates: selectedItems.map((fastq) => ({
        id: fastq.id,
        data: { robotic_prep: value },
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          Robotic Prep <Kbd shortcut="R" variant="subtle" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set Robotic Prep</DialogTitle>
          <DialogDescription>
            Set the robotic prep for all selected FASTQ files.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="font-semibold">
              Set robotic prep for all selected FASTQs:
            </Label>
            <div className="mt-3">
              <Switch
                checked={currentValue || false}
                onCheckedChange={handleChange}
                aria-label="Toggle robotic prep for all selected FASTQs"
              />
            </div>
          </div>

          <FastqsSummary
            selectedItems={selectedItems}
            fieldExtractor={(fastq) =>
              fastq.robotic_prep ? "Enabled" : "Disabled"
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
