import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq } from "@/types";

type FastqsExcludeSingleProps = {
  fastq: Fastq | null;
  isOpen: boolean;
  onClose: () => void;
};

export function FastqsExcludeSingle({
  fastq,
  isOpen,
  onClose,
}: FastqsExcludeSingleProps) {
  const { update } = usePocketBaseMutation<Fastq>("fastqs");

  function handleExclude() {
    if (fastq) {
      update(
        { id: fastq.id, data: { excluded: true } },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (error) => {
            console.error("Failed to exclude fastq:", error);
          },
        },
      );
    }
  }

  if (!fastq) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exclude Sample</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to exclude <strong>{fastq.name}</strong>? This
            action will mark the sample as excluded from analysis.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleExclude}>Exclude</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
