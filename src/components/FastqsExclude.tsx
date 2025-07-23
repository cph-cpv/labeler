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
import { useFastqs } from "@/hooks/useFastqs.ts";
import type { Fastq } from "@/types.ts";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function FastqsExclude() {
  const [open, setOpen] = useState(false);
  const { clearSelection, selectedItems: selectedFastqs } =
    useSelectionContext<Fastq>();
  const { updateMultiple } = useFastqs();

  async function handleExclude() {
    try {
      await updateMultiple(
        selectedFastqs.map((fastq) => ({
          id: fastq.id,
          excluded: true,
        })),
      );
      clearSelection();
      setOpen(false);
    } catch (error) {
      console.error("Failed to exclude FASTQs:", error);
    }
  }

  useHotkeys(
    "e",
    () => {
      setOpen(true);
    },
    {
      enableOnFormTags: true,
      enabled: selectedFastqs.length > 0,
    },
  );

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Exclude <Kbd shortcut="E" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exclude FASTQs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exclude {selectedFastqs.length} file
              {selectedFastqs.length === 1 ? "" : "s"}? This action will mark
              the selected files as excluded.
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
