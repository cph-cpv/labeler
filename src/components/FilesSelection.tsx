import { FilesAnnotate } from "@/components/FilesAnnotate.tsx";
import { FilesLabel } from "@/components/FilesLabel.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import { cn } from "@/utils.ts";

interface FilesSelectionProps {
  selectedCount: number;
  onExclude: () => void;
}

export function FilesSelection({
  selectedCount,
  onExclude,
}: FilesSelectionProps) {
  const isVisible = selectedCount > 0;

  return (
    <div
      className={cn(
        "fixed",
        "bottom-0",
        "left-0",
        "right-0",
        "z-50",
        "bg-background",
        "border-t",
        "shadow-lg",
        "transition-transform",
        "duration-300",
        "ease-in-out",
        isVisible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? "file" : "files"} selected
          </div>
          <div className="flex gap-2">
            <FilesAnnotate selectedCount={selectedCount} />
            <FilesLabel selectedCount={selectedCount} />
            <Button onClick={onExclude} variant="outline">
              Exclude <Kbd shortcut="E" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
