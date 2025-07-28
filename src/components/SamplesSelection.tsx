import { SamplesLabel } from "@/components/SamplesLabel.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import { SelectionBar } from "@/components/ui/selection-bar.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function SamplesSelection() {
  const { selectedCount, selectedIds } = useSelection();

  const [virusesDialogOpen, setVirusesDialogOpen] = React.useState(false);

  useHotkeys(
    "l",
    () => {
      setVirusesDialogOpen(true);
    },
    {
      enabled: selectedCount > 0,
      enableOnFormTags: true,
    },
  );

  if (selectedCount > 0) {
    return (
      <SelectionBar itemName="sample">
        <SamplesLabel
          onOpenChange={setVirusesDialogOpen}
          open={virusesDialogOpen}
          selectedSampleIds={Array.from(selectedIds)}
          selectedCount={selectedCount}
        />
        <Button variant="outline" onClick={() => setVirusesDialogOpen(true)}>
          Viruses <Kbd shortcut="V" />
        </Button>
      </SelectionBar>
    );
  }
}
