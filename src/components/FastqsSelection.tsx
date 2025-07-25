import { FastqsAnnotate } from "@/components/FastqsAnnotate.tsx";
import { FastqsExcludeMultiple } from "@/components/FastqsExcludeMultiple.tsx";
import { FastqsInclude } from "@/components/FastqsInclude.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";
import { cn } from "@/lib/utils.ts";
import type { Fastq } from "@/types.ts";

type FastqsSelectionProps = {
  category: string;
};

export function FastqsSelection({ category }: FastqsSelectionProps) {
  const { selectedCount } = useSelection<Fastq>();

  return (
    <div
      className={cn(
        "fixed",
        "bottom-0",
        "left-0",
        "right-0",
        "z-50",
        "bg-stone-50",
        "border-t-2",
        "shadow-lg",
        "transition-transform",
        "duration-300",
        "ease-in-out",
        "scrollbar-gutter-stable",
        selectedCount > 0 ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? "FASTQ" : "FASTQs"} selected
          </div>
          <div className="flex gap-2">
            {category === "excluded" ? (
              <FastqsInclude />
            ) : (
              <>
                <FastqsAnnotate />
                <FastqsExcludeMultiple />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
