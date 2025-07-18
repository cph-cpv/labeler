import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import { useSelectionContext } from "@/contexts/SelectionContext.tsx";
import { pb } from "@/lib/pocketbase.ts";
import type { Fastq } from "@/types.ts";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface FilesExcludeProps {
  selectedCount: number;
  onExcludeComplete: () => void;
}

export function FilesExclude({
  selectedCount,
  onExcludeComplete,
}: FilesExcludeProps) {
  const [excludeDialogOpen, setExcludeDialogOpen] = useState(false);
  const { clearSelection, selectedItems } = useSelectionContext<Fastq>();

  const handleExclude = async () => {
    try {
      await Promise.all(
        selectedItems.map((file) =>
          pb.collection("files").update(file.id, { excluded: true }),
        ),
      );
      clearSelection();
      onExcludeComplete();
      setExcludeDialogOpen(false);
    } catch (error) {
      console.error("Failed to exclude files:", error);
    }
  };

  useHotkeys("e", () => {
    if (selectedCount > 0) {
      setExcludeDialogOpen(true);
    }
  });

  return (
    <>
      <Button onClick={() => setExcludeDialogOpen(true)} variant="outline">
        Exclude <Kbd shortcut="E" />
      </Button>

      <AlertDialog open={excludeDialogOpen} onOpenChange={setExcludeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exclude Files</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exclude {selectedCount} file
              {selectedCount === 1 ? "" : "s"}? This action will mark the
              selected files as excluded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExclude}>
              Exclude
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
