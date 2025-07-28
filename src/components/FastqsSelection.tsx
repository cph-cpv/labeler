import { FastqsAnnotate } from "@/components/FastqsAnnotate.tsx";
import { FastqsExcludeMultiple } from "@/components/FastqsExcludeMultiple.tsx";
import { FastqsInclude } from "@/components/FastqsInclude.tsx";
import { SelectionBar } from "@/components/ui/selection-bar.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq } from "@/types.ts";

type FastqsSelectionProps = {
  category: string;
};

export function FastqsSelection({ category }: FastqsSelectionProps) {
  const { onClearSelection, selectedCount } = useSelection<Fastq>();

  return (
    <SelectionBar
      selectedCount={selectedCount}
      itemName="FASTQ"
      onClearSelection={onClearSelection}
    >
      {category === "excluded" ? (
        <FastqsInclude />
      ) : (
        <>
          <FastqsAnnotate />
          <FastqsExcludeMultiple />
        </>
      )}
    </SelectionBar>
  );
}
