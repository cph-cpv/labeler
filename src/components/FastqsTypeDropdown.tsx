import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useFastqs } from "@/hooks/useFastqs.ts";
import type { FastqTypeFilter } from "@/types.tsx";

export function FastqsTypeDropdown() {
  const { setTypeFilter, typeFilter } = useFastqs();

  const handleFilterChange = (
    type: keyof FastqTypeFilter,
    checked: boolean,
  ) => {
    setTypeFilter({
      ...typeFilter,
      [type]: checked,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Type</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          checked={typeFilter.dsRNA}
          onCheckedChange={(checked) =>
            handleFilterChange("dsRNA", checked ?? false)
          }
        >
          dsRNA
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilter.smRNA}
          onCheckedChange={(checked) =>
            handleFilterChange("smRNA", checked ?? false)
          }
        >
          smRNA
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilter.unknown}
          onCheckedChange={(checked) =>
            handleFilterChange("unknown", checked ?? false)
          }
          className="text-muted-foreground italic"
        >
          Unknown
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
