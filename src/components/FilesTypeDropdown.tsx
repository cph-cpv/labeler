import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

type Checked = DropdownMenuCheckboxItemProps["checked"];

export type TypeFilter = {
  dsRNA: boolean;
  smRNA: boolean;
  unknown: boolean;
};

type FilesTypeDropdownProps = {
  typeFilter: TypeFilter;
  onTypeFilterChange: (filter: TypeFilter) => void;
};

export function FilesTypeDropdown({
  typeFilter,
  onTypeFilterChange,
}: FilesTypeDropdownProps) {
  const handleFilterChange = (type: keyof TypeFilter, checked: boolean) => {
    onTypeFilterChange({
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
