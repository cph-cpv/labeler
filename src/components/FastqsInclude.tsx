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

export function FastqsInclude() {
  const [open, setOpen] = useState(false);
  const { clearSelection, selectedItems: selectedFastqs } =
    useSelectionContext<Fastq>();
  const { updateMultiple } = useFastqs();

  async function handleInclude() {
    try {
      await updateMultiple(
        selectedFastqs.map((fastq) => ({
          id: fastq.id,
          excluded: false,
        })),
      );
      clearSelection();
      setOpen(false);
    } catch (error) {
      console.error("Failed to include FASTQs:", error);
    }
  }

  useHotkeys(
    "i",
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
        Include <Kbd shortcut="I" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Include FASTQs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to include {selectedFastqs.length} file
              {selectedFastqs.length === 1 ? "" : "s"}? This action will mark
              the selected files as included.
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
