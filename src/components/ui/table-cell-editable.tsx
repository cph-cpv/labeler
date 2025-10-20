import * as React from "react";
import { TableCell } from "./table.tsx";

type TableCellEditableProps = {
  children: React.ReactNode;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  ariaLabel: string;
  className?: string;
};

export function TableCellEditable({
  children,
  onClick,
  onKeyDown,
  ariaLabel,
  className,
}: TableCellEditableProps) {
  return (
    <TableCell className={className}>
      <div
        className="group relative cursor-pointer transition-colors hover:bg-muted/70 focus:bg-muted/70 focus:outline-none rounded px-2 py-1"
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">{children}</span>
        </div>
      </div>
    </TableCell>
  );
}
