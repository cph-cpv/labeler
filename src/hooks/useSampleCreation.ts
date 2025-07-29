import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery";
import type { Sample } from "@/types";
import { useCallback, useState } from "react";

export function useSampleCreation() {
  const { createAsync } = usePocketBaseMutation<Sample>("samples");
  const [error, setError] = useState<Error | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const createSample = useCallback(
    async (name: string): Promise<Sample | undefined> => {
      if (!name.trim() || isCreating) return undefined;

      setIsCreating(true);
      setError(undefined);

      try {
        const sample = await createAsync({ name: name.trim() });
        setIsCreating(false);
        return sample;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create sample");
        setError(error);
        setIsCreating(false);
        return undefined;
      }
    },
    [createAsync],
  );

  return { createSample, error, isCreating };
}
