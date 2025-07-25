import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery";
import type { Sample } from "@/types";
import { useCallback, useState } from "react";

export function useSampleCreation(onChange: (id: string) => void) {
  const { create } = usePocketBaseMutation<Sample>("samples");
  const [isCreating, setIsCreating] = useState(false);

  const createSample = useCallback(
    async (name: string) => {
      if (!name.trim() || isCreating) return;

      setIsCreating(true);
      try {
        create(
          { name: name.trim() },
          {
            onSuccess: (sample) => {
              onChange(sample.id);
              setIsCreating(false);
            },
            onError: (error) => {
              console.error("Failed to create sample:", error);
              setIsCreating(false);
            },
          },
        );
      } catch (error) {
        console.error("Failed to create sample:", error);
        setIsCreating(false);
      }
    },
    [create, onChange, isCreating],
  );

  return { createSample, isCreating };
}
