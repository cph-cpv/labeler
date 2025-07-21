import { usePocketBaseCount } from "@/hooks/usePocketBase.ts";

type VirusCounts = {
  allCount: number;
  isLoading: boolean;
  typedCount: number;
  untypedCount: number;
};

export function useVirusCounts(): VirusCounts {
  const { count: allCount, loading: allCountLoading } =
    usePocketBaseCount("viruses");

  const { count: typedCount, loading: typedCountLoading } = usePocketBaseCount(
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
