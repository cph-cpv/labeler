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
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq } from "@/types.ts";
import { useState } from "react";
import { useMultiSelectHotkey } from "@/hooks/useMultiSelectHotkey.tsx";

type PocketBaseFastq = {
  id: string;
  excluded: boolean | null;
};

export function FastqsInclude() {
  const [open, setOpen] = useState(false);
  const { onClearSelection, selectedItems: selectedFastqs } =
    useSelection<Fastq>();
  const { batchUpdateAsync } =
    usePocketBaseBatchUpdate<PocketBaseFastq>("fastqs");

  async function handleInclude() {
    try {
      await batchUpdateAsync({
        updates: selectedFastqs.map((fastq) => ({
          id: fastq.id,
          data: { excluded: false },
        })),
      });
      onClearSelection();
      setOpen(false);
    } catch (error) {
      console.error("Failed to include FASTQs:", error);
    }
  }

  useMultiSelectHotkey("i", selectedFastqs, setOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Include <Kbd shortcut="I" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Include FASTQs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to include {selectedFastqs.length} file
              {selectedFastqs.length === 1 ? "" : "s"}? This action will mark
              the selected FASTQs as included.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleInclude}>
              Include
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
