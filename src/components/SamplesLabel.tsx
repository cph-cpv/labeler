import { SamplesLabeler } from "@/components/SamplesLabeler.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import type { Virus } from "@/types.ts";
import { useEffect, useState } from "react";

type SamplesLabelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSampleIds: string[];
  selectedCount: number;
};

export function SamplesLabel({
  open,
  onOpenChange,
  selectedSampleIds,
  selectedCount,
}: SamplesLabelProps) {
  const [selectedViruses, setSelectedViruses] = useState<Virus[]>([]);

  // Clear selections when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedViruses([]);
    }
  }, [open]);

  function handleVirusSelect(virus: Virus) {
    setSelectedViruses((prev) => [...prev, virus]);
  }

  function handleVirusRemove(virus: Virus) {
    setSelectedViruses((prev) => prev.filter((v) => v.id !== virus.id));
  }

  function handleSave() {
    // TODO: Implement the actual association logic
    console.log(
      "Associating viruses:",
      selectedViruses.map((v) => v.id),
    );
    console.log("With samples:", selectedSampleIds);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Label Samples</DialogTitle>
          <DialogDescription>
            Mark {selectedCount === 1 ? "this sample" : "these samples"} as
            infected with the selected viruses.
          </DialogDescription>
        </DialogHeader>

        <SamplesLabeler
          selectedViruses={selectedViruses}
          onVirusSelect={handleVirusSelect}
          onVirusRemove={handleVirusRemove}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedViruses.length === 0}>
            Label with {selectedViruses.length} Virus
            {selectedViruses.length === 1 ? "" : "es"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
