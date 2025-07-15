import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import * as React from "react";

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function FilesTypeDropdown() {
  const [showDsRNA, setShowDsRNA] = React.useState<Checked>(true);
  const [showSmRNA, setShowSmRNA] = React.useState<Checked>(false);
  const [showUnknown, setShowUnknown] = React.useState<Checked>(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Type</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          checked={showDsRNA}
          onCheckedChange={setShowDsRNA}
        >
          dsRNA
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showSmRNA}
          onCheckedChange={setShowSmRNA}
        >
          smRNA
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showUnknown}
          onCheckedChange={setShowUnknown}
          className="text-muted-foreground italic"
        >
          Unknown
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
