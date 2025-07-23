import type { SelectableItem } from "@/hooks/useSelection.ts";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface SelectionContextValue<T extends SelectableItem> {
  // IDs for quick lookups and compatibility
  selectedIds: Set<string>;
  selectedCount: number;

  // Full objects for easy access
  selectedItems: T[];

  // Selection methods
  selectItem: (item: T) => void;
  deselectItem: (itemId: string) => void;
  toggleItem: (item: T, event?: React.MouseEvent) => void;
  selectAll: (items: T[]) => void;
  clearSelection: () => void;
  isSelected: (itemId: string) => boolean;
  isAllSelected: (items: T[]) => boolean;
}

const SelectionContext = createContext<SelectionContextValue<any> | null>(null);

export interface SelectionProviderProps<T extends SelectableItem> {
  children: ReactNode;
  items: T[];
}

export function SelectionProvider<T extends SelectableItem>({
  children,
  items,
}: SelectionProviderProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedIndexRef = useRef<number | null>(null);

  // Derive selected objects from IDs and current items
  const selectedItems = items.filter((item) =>
    selectedIds.has(item.id.toString()),
  );
  const selectedCount = selectedIds.size;

  const selectItem = useCallback((item: T) => {
    setSelectedIds((prev) => new Set(prev).add(item.id.toString()));
  }, []);

  const deselectItem = useCallback((itemId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const toggleItem = useCallback(
    (item: T, event?: React.MouseEvent) => {
      const itemId = item.id.toString();
      const itemIndex = items.findIndex((i) => i.id.toString() === itemId);

      setSelectedIds((prev) => {
        const newSet = new Set(prev);

        // Handle shift-key range selection
        if (
          event?.shiftKey &&
          lastSelectedIndexRef.current !== null &&
          itemIndex !== -1
        ) {
          const startIndex = Math.min(lastSelectedIndexRef.current, itemIndex);
          const endIndex = Math.max(lastSelectedIndexRef.current, itemIndex);

          // Conventional behavior: clear all selections, then select the range
          // But exclude the clicked item itself if it would be deselected
          const wasItemSelected = newSet.has(itemId);
          newSet.clear();

          // Select all items in the range from anchor to current click
          for (let i = startIndex; i <= endIndex; i++) {
            if (i < items.length) {
              const rangeItemId = items[i].id.toString();
              // If this is the clicked item and it was selected, don't re-select it (deselect it)
              if (rangeItemId === itemId && wasItemSelected) {
                continue;
              }
              newSet.add(rangeItemId);
            }
          }
        } else {
          // Regular toggle behavior
          if (newSet.has(itemId)) {
            newSet.delete(itemId);
          } else {
            newSet.add(itemId);
          }
          lastSelectedIndexRef.current = itemIndex;
        }

        return newSet;
      });
    },
    [items],
  );

  const selectAll = useCallback(
    (items: T[]) => {
      const allItemIds = new Set(items.map((item) => item.id.toString()));
      const isCurrentlyAllSelected =
        items.length > 0 &&
        items.every((item) => selectedIds.has(item.id.toString()));

      if (isCurrentlyAllSelected) {
        // If all are selected, clear selection
        setSelectedIds(new Set());
      } else {
        // If not all are selected, select all
        setSelectedIds(allItemIds);
      }
    },
    [selectedIds],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (itemId: string) => {
      return selectedIds.has(itemId);
    },
    [selectedIds],
  );

  const isAllSelected = useCallback(
    (items: T[]) => {
      return (
        items.length > 0 &&
        items.every((item) => selectedIds.has(item.id.toString()))
      );
    },
    [selectedIds],
  );

  const value: SelectionContextValue<T> = {
    selectedIds,
    selectedCount,
    selectedItems,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelectionContext<
  T extends SelectableItem,
>(): SelectionContextValue<T> {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error(
      "useSelectionContext must be used within a SelectionProvider",
    );
  }
  return context;
}
