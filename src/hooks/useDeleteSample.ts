
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery";
import type { BaseSample } from "@/types";

export function useDeleteSample() {
  const {
    remove,
    removeAsync,
    isRemoving,
    removeError,
  } = usePocketBaseMutation<BaseSample>("samples");

  return {
    deleteSample: remove,
    deleteSampleAsync: removeAsync,
    isDeleting: isRemoving,
    deleteError: removeError,
  };
}
