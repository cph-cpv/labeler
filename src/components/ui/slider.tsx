import { cn } from "@/lib/utils.ts";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  const currentValue = _values[0] ?? min;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-sm text-muted-foreground">{min}</span>
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
          )}
        >
          {/* Quality slider gradient (1=bad, 5=excellent) */}
          {min === 1 && max === 5 && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-400 via-yellow-400 to-orange-500 rounded-full" />
          )}
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
              // Hide the range fill for quality slider to show colors underneath
              min === 1 && max === 5 && "bg-transparent",
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
      <span className="text-sm text-muted-foreground">{max}</span>
      <div className="w-12 text-right ml-2">
        <span className="text-lg font-semibold">{currentValue}</span>
      </div>
    </div>
  );
}

export { Slider };
