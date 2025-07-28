import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Value</TableHead>
            <TableHead>Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map(([value, count]) => (
            <TableRow key={value}>
              <TableCell>{value}</TableCell>
              <TableCell>{count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
