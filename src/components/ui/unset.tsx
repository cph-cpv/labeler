import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleSlash } from "lucide-react";
import { forwardRef } from "react";

export function UnsetIcon({
  className,
  ...props
}: React.ComponentProps<typeof CircleSlash>) {
  return (
    <CircleSlash
      className={cn("size-3.5 text-red-400", className)}
      {...props}
    />
  );
}

export interface UnsetButtonProps extends Omit<ButtonProps, "children"> {
  onUnset: () => void;
  text?: string;
}

export const UnsetButton = forwardRef<HTMLButtonElement, UnsetButtonProps>(
  ({ onUnset, text = "Unset", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="button"
        variant="outline"
        onClick={onUnset}
        className={`flex items-center gap-2 ${className || ""}`}
        {...props}
      >
        <UnsetIcon />
        {text}
      </Button>
    );
  },
);

UnsetButton.displayName = "UnsetButton";
