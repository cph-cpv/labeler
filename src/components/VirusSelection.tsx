import { SelectionBar } from "@/components/ui/selection-bar.tsx";
import { VirusTypeAssign } from "@/components/VirusTypeAssign.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";

export function VirusSelection() {
  const { onClearSelection, selectedCount } = useSelection();

  return (
    <SelectionBar
      selectedCount={selectedCount}
      itemName="virus"
      onClearSelection={onClearSelection}
    >
      <VirusTypeAssign />
    </SelectionBar>
  );
}
