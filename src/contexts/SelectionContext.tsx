import type { SelectableItem } from "@/hooks/useSelection.ts";
import {
  createContext,
  useCallback,
  useContext,
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
  toggleItem: (item: T) => void;
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

  const toggleItem = useCallback((item: T) => {
    const itemId = item.id.toString();
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

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
