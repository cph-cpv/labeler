import { useCallback, useState } from "react";

export interface SelectableItem {
  id: number | string;
}

export function useSelection<T extends SelectableItem>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id.toString())));
    }
  }, [selectedItems.size, items]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isAllSelected = selectedItems.size === items.length && items.length > 0;
  const selectedCount = selectedItems.size;

  return {
    selectedItems,
    selectedCount,
    isAllSelected,
    handleItemSelect,
    handleSelectAll,
    clearSelection,
    setSelectedItems,
  };
}
