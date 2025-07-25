import { Badge } from "@/components/ui/badge.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { X } from "lucide-react";

type FastqsAnnotateSelectionSummaryProps<T> = {
  selectedItems: T[];
  fieldExtractor: (item: T) => string | number | null | undefined;
  emptyMessage?: string;
  fieldValueFormatter?: (value: string | number | null | undefined) => string;
};

export function FastqsAnnotateSelection<T>({
  selectedItems,
  fieldExtractor,
  emptyMessage = "No FASTQs selected",
  fieldValueFormatter = (value) => value?.toString() || "Unset",
}: FastqsAnnotateSelectionSummaryProps<T>) {
  const counts = selectedItems.reduce(
    (acc, item) => {
      const value = fieldExtractor(item);
      const displayValue = fieldValueFormatter(value);
      acc[displayValue] = (acc[displayValue] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const entries = Object.entries(counts);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">{emptyMessage}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm mb-3 font-semibold">Current Selection</h3>
      {entries.map(([value, count]) => (
        <div className="flex items-center gap-2" key={value}>
          <Badge className="w-8">{count}</Badge>
          <X size={12} />
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}
