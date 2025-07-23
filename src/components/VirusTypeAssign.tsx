import { Button } from "@/components/ui/button.tsx";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { useSelectionContext } from "@/contexts/SelectionContext.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import type { Virus, VirusType } from "@/types.ts";
import { useForm } from "@tanstack/react-form";
import {
  Check,
  ChevronsUpDown,
  Circle,
  Hexagon,
  SatelliteIcon,
} from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface VirusTypeAssignProps {
  selectedCount: number;
}

const virusTypes: { value: VirusType; label: string; icon: typeof Hexagon }[] =
  [
    { value: "Virus", label: "Virus", icon: Hexagon },
    { value: "Satellite", label: "Satellite", icon: SatelliteIcon },
    { value: "Viroid", label: "Viroid", icon: Circle },
  ];

export function VirusTypeAssign({ selectedCount }: VirusTypeAssignProps) {
  const { selectedItems: selectedViruses, clearSelection } =
    useSelectionContext<Virus>();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { batchUpdateAsync, isBatchUpdating, batchUpdateError } =
    usePocketBaseBatchUpdate<Virus>("viruses");

  const form = useForm({
    defaultValues: {
      type: null as VirusType | null,
    },
    onSubmit: async ({ value }) => {
      if (value.type && selectedViruses.length > 0) {
        const updates = selectedViruses.map((virus) => ({
          id: virus.id.toString(),
          data: { type: value.type },
        }));

        await batchUpdateAsync({ updates });

        // Close dialog and clear selection
        setDialogOpen(false);
        form.reset();
        clearSelection();
      }
    },
  });

  useHotkeys(
    "t",
    () => {
      setDialogOpen(true);
    },
    { enableOnFormTags: true },
  );

  const handleTypeSelect = (type: VirusType) => {
    form.setFieldValue("type", type);
    setOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Type <Kbd shortcut="T" variant="invert" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Virus Type</DialogTitle>
          <DialogDescription>
            Set the type for {selectedCount} selected{" "}
            {selectedCount === 1 ? "virus" : "viruses"}.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <form.Field
              name="type"
              children={(field) => {
                const selectedTypeData = virusTypes.find(
                  (t) => t.value === field.state.value,
                );
                return (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Virus Type</label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                        >
                          {selectedTypeData ? (
                            <div className="flex items-center gap-2">
                              <selectedTypeData.icon className="h-4 w-4" />
                              {selectedTypeData.label}
                            </div>
                          ) : (
                            "Select type..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[--radix-popper-anchor-width] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandList>
                            <CommandGroup>
                              {virusTypes.map((type) => (
                                <CommandItem
                                  key={type.value}
                                  value={type.value}
                                  onSelect={() => handleTypeSelect(type.value)}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      field.state.value === type.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <type.icon className="mr-2 h-4 w-4" />
                                  {type.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {form.state.errors.length > 0 && (
              <div className="text-sm text-red-500">
                {form.state.errors.map((error, i) => (
                  <p key={i}>{error}</p>
                ))}
              </div>
            )}
            {batchUpdateError && (
              <div className="text-sm text-red-500">
                <p>Failed to update virus types: {batchUpdateError.message}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.state.values.type || isBatchUpdating}
              >
                {isBatchUpdating ? "Assigning..." : "Assign Type"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
