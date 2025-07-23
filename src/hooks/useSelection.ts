import {
  SelectionProvider,
  useSelectionContext,
} from "@/contexts/SelectionContext.tsx";

export interface SelectableItem {
  id: number | string;
}

export function useSelection<T extends SelectableItem>(items: T[]) {
  const context = useSelectionContext<T>();

  return {
    selectedItems: context.selectedIds,
    selectedCount: context.selectedCount,
    isAllSelected: context.isAllSelected(items),
    handleItemSelect: (itemId: string, event?: React.MouseEvent) => {
      const item = items.find((i) => i.id.toString() === itemId);
      if (item) {
        context.toggleItem(item, event);
      }
    },
    handleSelectAll: () => context.selectAll(items),
    clearSelection: context.clearSelection,
    setSelectedItems: (newSelection: Set<string>) => {
      // Clear current selection first
      context.clearSelection();
      // Then select the new items
      newSelection.forEach((itemId) => {
        const item = items.find((i) => i.id.toString() === itemId);
        if (item) {
          context.selectItem(item);
        }
      });
    },
  };
}

// Re-export for convenience
export { SelectionProvider };
