import { usePocketBaseCount } from "@/hooks/usePocketBase.ts";

type VirusCounts = {
  allCount: number;
  typedCount: number;
  untypedCount: number;
  loading: boolean;
};

export function useVirusCounts(): VirusCounts {
  const { count: allCount, loading: allCountLoading } =
    usePocketBaseCount("viruses");
  const { count: typedCount, loading: typedCountLoading } = usePocketBaseCount(
    "viruses",
    "type != null",
  );
  const { count: untypedCount, loading: untypedCountLoading } =
    usePocketBaseCount("viruses", "type = null");

  return {
    allCount,
    typedCount,
    untypedCount,
    loading: allCountLoading || typedCountLoading || untypedCountLoading,
  };
}
