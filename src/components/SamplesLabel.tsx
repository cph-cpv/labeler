import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  TwoPaneRemovableScrollArea,
  TwoPanes,
  TwoPaneScrollArea,
} from "@/components/ui/two-panes.tsx";
import { useViruses } from "@/hooks/useViruses.ts";
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
  const [searchValue, setSearchValue] = useState("");
  const [selectedViruses, setSelectedViruses] = useState<Virus[]>([]);

  const { viruses, isLoading, error } = useViruses({
    search: searchValue,
  });

  // Filter out already selected viruses from available list
  const selectedVirusIds = new Set(selectedViruses.map((v) => v.id));
  const availableViruses = viruses.filter(
    (virus) => !selectedVirusIds.has(virus.id),
  );

  // Clear selections when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedViruses([]);
      setSearchValue("");
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

  function renderVirusItem(virus: Virus) {
    return (
      <div>
        <div className="font-medium">{virus.name}</div>
        {virus.acronym && (
          <div className="text-sm text-gray-600">{virus.acronym}</div>
        )}
        {virus.type && (
          <div className="text-xs text-gray-500">{virus.type}</div>
        )}
      </div>
    );
  }

  function renderSelectedVirusItem(virus: Virus) {
    return (
      <div>
        <div className="font-medium">{virus.name}</div>
        {virus.acronym && (
          <div className="text-sm text-gray-600">{virus.acronym}</div>
        )}
        {virus.type && (
          <div className="text-xs text-gray-500">{virus.type}</div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Label Samples</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-red-600">
            Error loading viruses: {error.message}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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

        <div className="space-y-4">
          <Input
            placeholder="Search viruses by name or acronym..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <TwoPanes
            leftTitle="Available Viruses"
            rightTitle="Selected Viruses"
            leftCount={availableViruses.length}
            rightCount={selectedViruses.length}
            isLoading={isLoading}
            leftContent={
              <TwoPaneScrollArea
                items={availableViruses}
                onItemClick={handleVirusSelect}
                emptyStateText={
                  searchValue
                    ? "No available viruses found"
                    : "No available viruses"
                }
                renderItem={renderVirusItem}
                getItemId={(virus) => `available-virus-${virus.id}`}
                ariaLabel="Available viruses for selection"
              />
            }
            rightContent={
              <TwoPaneRemovableScrollArea
                items={selectedViruses}
                onItemRemove={handleVirusRemove}
                emptyStateText="No viruses selected"
                renderItem={renderSelectedVirusItem}
                getItemId={(virus) => `selected-virus-${virus.id}`}
                ariaLabel="Selected viruses for association"
              />
            }
          />
        </div>

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
