import { Badge } from "@/components/ui/badge.tsx";
import { Label } from "@/components/ui/label.tsx";
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area.tsx";
import { ArrowLeftRight } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useId, useRef, useState } from "react";

type TwoPanesProps = {
  leftTitle: string;
  rightTitle: string;
  leftCount: number;
  rightCount: number;
  leftContent: ReactNode;
  rightContent: ReactNode;
  isLoading?: boolean;
  className?: string;
  height?: string;
};

export function TwoPanes({
  leftTitle,
  rightTitle,
  leftCount,
  rightCount,
  leftContent,
  rightContent,
  isLoading = false,
  className,
  height = "h-80",
}: TwoPanesProps) {
  const leftId = useId();
  const rightId = useId();
  const leftLabelId = `${leftId}-label`;
  const rightLabelId = `${rightId}-label`;

  return (
    <div
      className={`${height} ${className || ""}`}
      role="application"
      aria-label="Dual pane selection interface"
    >
      <div className="flex gap-2 items-stretch h-full">
        <section
          className="flex-1 space-y-2 flex flex-col"
          role="region"
          aria-labelledby={leftLabelId}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label id={leftLabelId} className="text-sm font-medium">
                {leftTitle}
              </Label>
              <Badge variant="secondary" aria-label={`${leftCount} items`}>
                {leftCount}
              </Badge>
            </div>
            <LoadingIndicator isLoading={isLoading} />
          </div>
          {leftContent}
        </section>
        <div
          className="flex items-center justify-center"
          role="separator"
          aria-orientation="vertical"
          aria-label="Selection transfer area"
        >
          <ArrowLeftRight className="size-4" aria-hidden="true" />
        </div>
        <section
          className="flex-1 space-y-2 flex flex-col"
          role="region"
          aria-labelledby={rightLabelId}
        >
          <div className="flex items-center gap-2">
            <Label id={rightLabelId} className="text-sm font-medium">
              {rightTitle}
            </Label>
            <Badge variant="secondary" aria-label={`${rightCount} items`}>
              {rightCount}
            </Badge>
          </div>
          {rightContent}
        </section>
      </div>
    </div>
  );
}

type TwoPaneScrollAreaProps<T> = {
  items: T[];
  onItemClick: (item: T) => void;
  emptyStateText: string;
  renderItem: (item: T) => ReactNode;
  className?: string;
  getItemId?: (item: T, index: number) => string;
  ariaLabel?: string;
};

export function TwoPaneScrollArea<T>({
  items,
  onItemClick,
  emptyStateText,
  renderItem,
  className = "h-72",
  getItemId,
  ariaLabel,
}: TwoPaneScrollAreaProps<T>) {
  const listboxRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const listboxId = useId();

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (items.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Home":
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          event.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            onItemClick(items[focusedIndex]);
          }
          break;
      }
    },
    [items, focusedIndex, onItemClick],
  );

  const handleItemClick = useCallback(
    (item: T, index: number) => {
      setFocusedIndex(index);
      onItemClick(item);
    },
    [onItemClick],
  );

  const getActiveDescendant = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < items.length) {
      return getItemId
        ? getItemId(items[focusedIndex], focusedIndex)
        : `${listboxId}-option-${focusedIndex}`;
    }
    return undefined;
  }, [focusedIndex, items, getItemId, listboxId]);

  return (
    <ScrollArea className={`border w-full rounded-md ${className}`}>
      <div
        ref={listboxRef}
        role="listbox"
        id={listboxId}
        aria-label={ariaLabel || "Available options"}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-activedescendant={getActiveDescendant()}
        className="outline-none"
      >
        {items.map((item, index) => {
          const itemId = getItemId
            ? getItemId(item, index)
            : `${listboxId}-option-${index}`;
          const isFocused = index === focusedIndex;

          return (
            <div
              key={itemId}
              id={itemId}
              role="option"
              aria-selected={false}
              className={`p-2 text-sm border-b last:border-b-0 cursor-pointer ${
                isFocused
                  ? "bg-blue-100 dark:bg-blue-900 outline outline-2 outline-blue-500"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleItemClick(item, index)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {renderItem(item)}
            </div>
          );
        })}
        {items.length === 0 && (
          <div
            className="p-2 text-sm text-muted-foreground text-center"
            role="status"
          >
            {emptyStateText}
          </div>
        )}
      </div>
      <ScrollBar />
    </ScrollArea>
  );
}

type TwoPaneRemovableScrollAreaProps<T> = {
  items: T[];
  onItemRemove: (item: T) => void;
  emptyStateText: string;
  renderItem: (item: T) => ReactNode;
  className?: string;
  getItemId?: (item: T, index: number) => string;
  ariaLabel?: string;
};

export function TwoPaneRemovableScrollArea<T>({
  items,
  onItemRemove,
  emptyStateText,
  renderItem,
  className = "h-72",
  getItemId,
  ariaLabel,
}: TwoPaneRemovableScrollAreaProps<T>) {
  const listboxRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const listboxId = useId();

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (items.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Home":
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          event.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
        case "Delete":
        case "Backspace":
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            onItemRemove(items[focusedIndex]);
            // Adjust focus after removal
            setFocusedIndex((prev) => Math.min(prev, items.length - 2));
          }
          break;
      }
    },
    [items, focusedIndex, onItemRemove],
  );

  const handleItemRemove = useCallback(
    (item: T) => {
      onItemRemove(item);
      // Adjust focus after removal
      setFocusedIndex((prev) => Math.min(prev, items.length - 2));
    },
    [onItemRemove, items.length],
  );

  const getActiveDescendant = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < items.length) {
      return getItemId
        ? getItemId(items[focusedIndex], focusedIndex)
        : `${listboxId}-option-${focusedIndex}`;
    }
    return undefined;
  }, [focusedIndex, items, getItemId, listboxId]);

  return (
    <ScrollArea className={`border w-full rounded-md ${className}`}>
      <div
        ref={listboxRef}
        role="listbox"
        id={listboxId}
        aria-label={ariaLabel || "Selected options"}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-activedescendant={getActiveDescendant()}
        className="outline-none"
      >
        {items.map((item, index) => {
          const itemId = getItemId
            ? getItemId(item, index)
            : `${listboxId}-option-${index}`;
          const isFocused = index === focusedIndex;

          return (
            <div
              key={itemId}
              id={itemId}
              role="option"
              aria-selected={true}
              aria-label="Click to remove from selection"
              className={`p-2 text-sm border-b last:border-b-0 cursor-pointer ${
                isFocused
                  ? "bg-blue-100 dark:bg-blue-900 outline outline-2 outline-blue-500"
                  : "hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
              onClick={() => handleItemRemove(item)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {renderItem(item)}
            </div>
          );
        })}
        {items.length === 0 && (
          <div
            className="p-2 text-sm text-muted-foreground text-center"
            role="status"
          >
            {emptyStateText}
          </div>
        )}
      </div>
      <ScrollBar />
    </ScrollArea>
  );
}
