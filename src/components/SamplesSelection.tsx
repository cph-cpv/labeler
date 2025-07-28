import { Button } from "@/components/ui/button.tsx";
import { SelectionBar } from "@/components/ui/selection-bar.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";

export function SamplesSelection() {
  const { onClearSelection, selectedCount } = useSelection();

  if (selectedCount > 0) {
    return (
      <SelectionBar
        selectedCount={selectedCount}
        itemName="sample"
        onClearSelection={onClearSelection}
      >
        <Button variant="outline" onClick={() => setLabelDialogOpen(true)}>
          Label
        </Button>
      </SelectionBar>
    );
  }
}
