import { usePocketBaseFirst } from "@/hooks/usePocketBaseQuery";
import type { Virus } from "@/types";

export function useVirusByAcronym(acronym: string): {
  virus: Virus | null;
  isLoading: boolean;
  error: Error | null;
} {
  const filter = `acronym = '${acronym}'`;
  const { data, isLoading, error } = usePocketBaseFirst<Virus>(
    "viruses",
    filter,
  );

  return { virus: data, isLoading, error };
}
