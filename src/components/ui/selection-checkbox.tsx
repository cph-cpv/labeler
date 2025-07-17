import type { SelectableItem } from "@/hooks/useSelection.ts";

interface SelectionCheckboxProps<T extends SelectableItem> {
  item: T;
  selectedItems: Set<string>;
  onItemSelect: (itemId: string) => void;
  getItemLabel: (item: T) => string;
}

export function SelectionCheckbox<T extends SelectableItem>({
  item,
  selectedItems,
  onItemSelect,
  getItemLabel,
}: SelectionCheckboxProps<T>) {
  return (
    <label className="flex items-center justify-center cursor-pointer p-2">
      <input
        type="checkbox"
        checked={selectedItems.has(item.id.toString())}
        onChange={() => onItemSelect(item.id.toString())}
        className="rounded"
        aria-label={`Select ${getItemLabel(item)}`}
      />
    </label>
  );
}

interface SelectAllCheckboxProps<T extends SelectableItem> {
  items: T[];
  isAllSelected: boolean;
  onSelectAll: () => void;
}

export function SelectAllCheckbox<T extends SelectableItem>({
  items,
  isAllSelected,
  onSelectAll,
}: SelectAllCheckboxProps<T>) {
  return (
    <label className="flex items-center justify-center cursor-pointer p-2">
      <input
        type="checkbox"
        checked={isAllSelected}
        onChange={onSelectAll}
        className="rounded"
        aria-label="Select all items"
      />
    </label>
  );
}
