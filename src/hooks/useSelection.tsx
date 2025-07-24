import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export interface SelectableItem {
  id: string;
}

interface SelectionContextValue<T extends SelectableItem> {
  items: T[];
  selectedIds: Set<string>;
  setItems: (items: T[]) => void;
  setSelectedIds: (
    ids: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => void;
}

const SelectionContext = createContext<SelectionContextValue<any> | null>(null);

export type SelectionProviderProps = PropsWithChildren<{}>;

export function SelectionProvider({ children }: SelectionProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<SelectableItem[]>([]);

  const value: SelectionContextValue<SelectableItem> = {
    items,
    selectedIds,
    setItems,
    setSelectedIds,
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

  const anchorIndexRef = useRef<number | null>(null);
  const lastClickedIndexRef = useRef<number | null>(null);

  const { items, selectedIds, setItems, setSelectedIds } = context;

  // Create index map for O(1) lookups
  const itemIndexMap = useMemo(
    () =>
      new Map((items as T[]).map((item, index) => [item.id.toString(), index])),
    [items],
  );

  // Derive selected objects from IDs and current items
  const selectedItems = useMemo(
    () => (items as T[]).filter((item) => selectedIds.has(item.id.toString())),
    [items, selectedIds],
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
    (itemId: string, event?: React.MouseEvent) => {
      const itemIndex = itemIndexMap.get(itemId) ?? -1;

      setSelectedIds((prev) => {
        const newSet = new Set(prev);

        // Handle shift-key range selection
        if (
          event?.shiftKey &&
          anchorIndexRef.current !== null &&
          itemIndex !== -1
        ) {
          const startIndex = Math.min(anchorIndexRef.current, itemIndex);
          let endIndex = Math.max(anchorIndexRef.current, itemIndex);

          // Determine if we're expanding or contracting the selection
          if (lastClickedIndexRef.current !== null) {
            // Check if we're moving closer to anchor (contracting) or further away (expanding)
            const lastWasAboveAnchor =
              lastClickedIndexRef.current > anchorIndexRef.current;
            const currentIsAboveAnchor = itemIndex > anchorIndexRef.current;

            let isExpanding = false;

            if (lastWasAboveAnchor && currentIsAboveAnchor) {
              // Both above anchor: expanding if current is further from anchor
              isExpanding = itemIndex > lastClickedIndexRef.current;
            } else if (!lastWasAboveAnchor && !currentIsAboveAnchor) {
              // Both below anchor: expanding if current is further from anchor
              isExpanding = itemIndex < lastClickedIndexRef.current;
            } else {
              // Crossing anchor: always expanding
              isExpanding = true;
            }

            // If contracting, exclude the last clicked item from selection
            if (
              !isExpanding &&
              lastClickedIndexRef.current > startIndex &&
              lastClickedIndexRef.current <= endIndex
            ) {
              if (lastClickedIndexRef.current === endIndex) {
                endIndex -= 1;
              }
            }
          }

          // For shift-click: clear all selections and select only the range
          // from anchor to the clicked item (inclusive)
          newSet.clear();

          for (let i = startIndex; i <= endIndex; i++) {
            if (i < items.length) {
              const rangeItemId = (items as T[])[i].id.toString();
              newSet.add(rangeItemId);
            }
          }

          // Don't update anchor for shift-clicks - keep the original anchor point
        } else {
          // Regular toggle behavior
          if (newSet.has(itemId)) {
            newSet.delete(itemId);
          } else {
            newSet.add(itemId);
          }

          // Update anchor point only for non-shift clicks
          anchorIndexRef.current = itemIndex;
        }

        lastClickedIndexRef.current = itemIndex;

        return newSet;
      });
    },
    [anchorIndexRef, itemIndexMap, items, setSelectedIds],
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

  const isAllSelected = useMemo(() => {
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
