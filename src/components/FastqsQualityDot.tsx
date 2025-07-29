import type { FastqQuality } from "@/lib/quality.ts";

type FastqsQualityDotProps = {
  quality: FastqQuality;
  className?: string;
};

const QUALITY_COLORS: Record<FastqQuality, string> = {
  "1": "#440154", // Poor (dark purple)
  "2": "#3B528B", // Below Average (blue)
  "3": "#21908C", // Average (teal)
  "4": "#5DC863", // Good (green)
  "5": "#FDE725", // Excellent (bright yellow)
};

export function FastqsQualityDot({
  quality,
  className,
}: FastqsQualityDotProps) {
  return (
    <span
      className={`inline-block ${className || ""}`}
      style={{ color: QUALITY_COLORS[quality] }}
    >
      ⬤
    </span>
  );
}
