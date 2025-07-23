import { usePocketBaseCount } from "@/hooks/usePocketBaseQuery.ts";

type VirusCounts = {
  allCount: number;
  isLoading: boolean;
  typedCount: number;
  untypedCount: number;
};

export function useVirusCounts(): VirusCounts {
  const { data: allCount, isLoading: allCountLoading } =
    usePocketBaseCount("viruses");

  const { data: typedCount, isLoading: typedCountLoading } = usePocketBaseCount(
    "viruses",
    "type != null",
  );

  // Calculate untypedCount from allCount - typedCount to reduce one query
  const untypedCount = allCount - typedCount;

  return {
    allCount,
    isLoading: allCountLoading || typedCountLoading,
    typedCount,
    untypedCount,
  };
}
