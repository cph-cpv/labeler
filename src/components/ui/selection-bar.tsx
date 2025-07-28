import { Button } from "@/components/ui/button.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";
import { cn } from "@/lib/utils.ts";
import { SquareX } from "lucide-react";

interface SelectionBarProps {
  children: React.ReactNode;
  itemName: string;
}

export function SelectionBar({ itemName, children }: SelectionBarProps) {
  const { selectedCount, onClearSelection } = useSelection();

  const isVisible = selectedCount > 0;

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
        isVisible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? itemName : `${itemName}s`}{" "}
            selected
          </div>

          <div className="flex gap-2">
            {children}
            <Button variant="outline" onClick={onClearSelection}>
              <SquareX /> Clear Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
