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
import { useMultiEditDialogState } from "@/hooks/useMultiEditDialogState.tsx";
import { useMultiSelectHotkey } from "@/hooks/useMultiSelectHotkey.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq } from "@/types.ts";

export function FastqsExcludeMultiple() {
  const [open, setOpen] = useMultiEditDialogState();
  const { onClearSelection, selectedItems: selectedFastqs } =
    useSelection<Fastq>();
  const { batchUpdateAsync } = usePocketBaseBatchUpdate<Fastq>("fastqs");

  async function handleExclude() {
    try {
      const updates = selectedFastqs.map((fastq) => ({
        id: fastq.id,
        data: { excluded: true },
      }));

      await batchUpdateAsync({ updates });
      onClearSelection();
      setOpen(false);
    } catch (error) {
      console.error("Failed to exclude FASTQs:", error);
    }
  }

  useMultiSelectHotkey("x", selectedFastqs, setOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Exclude <Kbd shortcut="X" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exclude FASTQs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exclude {selectedFastqs.length} file
              {selectedFastqs.length === 1 ? "" : "s"}?
              <div className="mt-2">
                <div className="font-medium">This action will:</div>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>
                    Remove these FASTQs from search results and sample
                    association
                  </li>
                  <li>Hide these FASTQs from bulk management operations</li>
                </ul>
              </div>
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
