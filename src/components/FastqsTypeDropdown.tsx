import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { UnsetIcon } from "@/components/ui/unset.tsx";
import { useNavigate, useSearch } from "@tanstack/react-router";

export function FastqsTypeDropdown() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const types: string[] = search.type || [];

  function handleFilterChange(type: string, checked: boolean) {
    const newTypes = checked
      ? [...types, type]
      : types.filter((t) => t !== type);

    navigate({
      search: (prev) => ({
        ...prev,
        type: newTypes.length ? newTypes : undefined,
      }),
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Type</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          checked={types.includes("dsRNA")}
          onCheckedChange={(checked) =>
            handleFilterChange("dsRNA", checked ?? false)
          }
        >
          dsRNA
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={types.includes("smRNA")}
          onCheckedChange={(checked) =>
            handleFilterChange("smRNA", checked ?? false)
          }
        >
          smRNA
        </DropdownMenuCheckboxItem>
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
