import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FastqTypes } from "@/types.ts";
import { UnsetIcon } from "@/components/ui/unset.tsx";

export function FastqsTypeDropdown() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const types: string[] = Array.isArray(search.type)
    ? search.type
    : search.type
      ? [search.type]
      : [];

  function handleFilterChange(type: string, checked: boolean) {
    const newTypes = checked
      ? [...types, type]
      : types.filter((t) => t !== type);

    navigate({
      to: "/fastqs",
      search: (prev) => ({
        ...prev,
        type: newTypes.length ? newTypes : undefined,
      }),
    });
  }



  const dropdownOptions = FastqTypes.map(type =>
    <DropdownMenuCheckboxItem
      checked={types.includes(type)}
      onCheckedChange={(checked) =>
        handleFilterChange(type, checked ?? false)
      }
    >
      {type}
    </DropdownMenuCheckboxItem>,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Type</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {dropdownOptions}
        <DropdownMenuCheckboxItem
          checked={types.includes("Unset")}
          onCheckedChange={(checked) =>
            handleFilterChange("Unset", checked ?? false)
          }
          className="flex items-center gap-2 text-muted-foreground"
        >
          <UnsetIcon className="size-3.5" />
          Unset
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
