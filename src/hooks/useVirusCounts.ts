import { pb } from "@/lib/pocketbase";
import { useQuery } from "@tanstack/react-query";

type VirusCounts = {
  allCount: number;
  isLoading: boolean;
  typedCount: number;
  untypedCount: number;
};

export function useVirusCounts(): VirusCounts {
  const { data: allCount, isPending: allCountLoading } = useQuery({
    queryKey: ["pocketbase", "viruses", "count", "all"],
    queryFn: async () => {
      const result = await pb.collection("viruses").getList(1, 1, {
        fields: "id",
      });
      return result.totalItems;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const { data: typedCount, isPending: typedCountLoading } = useQuery({
    queryKey: ["pocketbase", "viruses", "count", "type != null"],
    queryFn: async () => {
      const result = await pb.collection("viruses").getList(1, 1, {
        filter: "type != null",
        fields: "id",
      });
      return result.totalItems;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const isLoading = allCountLoading || typedCountLoading;

  // Only calculate counts when both queries have valid numbers
  const hasValidData =
    typeof allCount === "number" && typeof typedCount === "number";

  return {
    allCount: hasValidData ? allCount : 0,
    isLoading,
    typedCount: hasValidData ? typedCount : 0,
    untypedCount: hasValidData ? allCount - typedCount : 0,
  };
}
