import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";
import { useCallback } from "react";

const ListboxContext = React.createContext<{
  onSelect: (value: string) => void;
  showCheckmarks: boolean;
  value: string | null;
} | null>(null);

export type ListboxOptionProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  label: string;
  value: string;
};

export function ListboxOption({
  children,
  className,
  disabled,
  label,
  value,
}: ListboxOptionProps) {
  const context = React.useContext(ListboxContext);

  if (!context) {
    throw new Error("ListboxOption must be used within a Listbox");
  }

  const isSelected = value === context.value;

  const handleClick = useCallback(
    () => context.onSelect(value),
    [context.onSelect, value],
  );

  return (
    <div
      aria-selected={isSelected}
      aria-disabled={disabled}
      aria-label={label}
      className={cn(
        "p-2 px-4 text-sm border-b last:border-b-0 cursor-pointer hover:bg-muted/50 flex items-center justify-between",
        disabled && "opacity-50 cursor-not-allowed",
        isSelected && "bg-muted/50",
        className,
      )}
      onClick={handleClick}
      role="option"
    >
      {context.showCheckmarks ? (
        <div className="flex items-center flex-1">
          <Check
            strokeWidth={2.5}
            className={cn("mr-2", "h-4", "w-4", "text-gray-700", {
              invisible: !isSelected,
            })}
          />
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

type ListboxProps = {
  "aria-label"?: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  showCheckmarks?: boolean;
  value?: string | null;
};

export function Listbox({
  "aria-label": ariaLabel = "Available options",
  children,
  placeholder = "No items available",
  className,
  height = "h-48",
  onSelect,
  value = null,
  showCheckmarks = true,
}: ListboxProps) {
  function handleSelect(value: string) {
    onSelect(value);
  }

  const hasChildren = React.Children.count(children) > 0;

  const contextValue = React.useMemo(
    () => ({
      value,
      onSelect: handleSelect,
      showCheckmarks,
    }),
    [value, showCheckmarks, handleSelect],
  );

  return (
    <ListboxContext.Provider value={contextValue}>
      <ScrollArea className={cn("border w-full rounded-md", height, className)}>
        <div role="listbox" aria-label={ariaLabel} className="outline-none">
          {!hasChildren ? (
            <div
              className="p-2 text-sm text-muted-foreground text-center"
              role="status"
            >
              {placeholder}
            </div>
          ) : (
            children
          )}
        </div>
        <ScrollBar />
      </ScrollArea>
    </ListboxContext.Provider>
  );
}
