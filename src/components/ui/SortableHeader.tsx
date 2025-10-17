import { TableHead } from "@/components/ui/table.tsx";
import { cn } from "@/lib/utils.ts";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowDown, ArrowUp } from "lucide-react";

type fastqSortFields =
  | "name"
  | "date"
  | "quality"
  | "extraction"
  | "dilution"
  | "type"
  | "sample"
  | "library_prep";

type SortableHeaderProps = {
  displayName: string;
  fieldName: fastqSortFields;
  className?: string;
};

export function SortableHeader({
  displayName,
  fieldName,
  className,
}: SortableHeaderProps) {
  const search = useSearch({ from: "/fastqs" });
  const navigate = useNavigate({ from: "/fastqs" });

  const isSorted = search.sort?.includes(fieldName);
  const isDescending = isSorted && search.sort?.startsWith("-");

  const handleClick = () => {
    let newSort: string;
    if (isSorted) {
      newSort = isDescending ? fieldName : `-${fieldName}`;
    } else {
      newSort = fieldName;
    }
    navigate({ search: (prev) => ({ ...prev, sort: newSort }) });
  };

  return (
    <TableHead
      onClick={handleClick}
      className={cn("cursor-pointer hover:bg-muted/70", className)}
    >
      <div className="flex items-center">
        {displayName}
        {isSorted &&
          (isDescending ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUp className="ml-2 h-4 w-4" />
          ))}
      </div>
    </TableHead>
  );
}
