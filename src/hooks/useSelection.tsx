import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface SelectableItem {
  id: number | string;
}

interface SelectionContextValue<T extends SelectableItem> {
  selectedIds: Set<string>;
  setSelectedIds: (
    ids: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => void;
  lastSelectedIndexRef: React.RefObject<number | null>;
  items: T[];
  setItems: (items: T[]) => void;
}

const SelectionContext = createContext<SelectionContextValue<any> | null>(null);

export interface SelectionProviderProps {
  children: ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<SelectableItem[]>([]);
  const lastSelectedIndexRef = useRef<number | null>(null);

  const value: SelectionContextValue<SelectableItem> = {
    selectedIds,
    setSelectedIds,
    lastSelectedIndexRef,
    items,
    setItems,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection<T extends SelectableItem>() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }

  const { selectedIds, setSelectedIds, lastSelectedIndexRef, items, setItems } =
    context;

  // Derive selected objects from IDs and current items
  const selectedItems = (items as T[]).filter((item) =>
    selectedIds.has(item.id.toString()),
  );

  const onSelect = useCallback(
    (item: T) => {
      setSelectedIds((prev) => new Set(prev).add(item.id.toString()));
    },
    [setSelectedIds],
  );

  const onDeselect = useCallback(
    (itemId: string) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    },
    [setSelectedIds],
  );

  const onToggle = useCallback(
    (item: T, event?: React.MouseEvent) => {
      const itemId = item.id.toString();
      const itemIndex = (items as T[]).findIndex(
        (i) => i.id.toString() === itemId,
      );

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
              const rangeItemId = (items as T[])[i].id.toString();
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
    [items, setSelectedIds, lastSelectedIndexRef],
  );

  const onSelectAll = useCallback(() => {
    const allItemIds = new Set(
      (items as T[]).map((item) => item.id.toString()),
    );
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
  }, [items, selectedIds, setSelectedIds]);

  const onClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, [setSelectedIds]);

  const isAnySelected = useCallback(
    (itemId: string) => {
      return selectedIds.has(itemId);
    },
    [selectedIds],
  );

  const isAllSelected = useCallback(() => {
    return (
      items.length > 0 &&
      items.every((item) => selectedIds.has(item.id.toString()))
    );
  }, [items, selectedIds]);

  return {
    selectedCount: selectedIds.size,
    selectedIds,
    selectedItems,
    onSetItems: setItems as (items: T[]) => void,
    onSelect,
    onDeselect,
    onToggle,
    onSelectAll,
    onClearSelection,
    isAllSelected,
    isAnySelected,
  };
}
