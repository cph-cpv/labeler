import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type LoadingIndicatorProps = {
  isLoading: boolean;
};

export function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  const [showLoading, setShowLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Start the delay timer to show loading
      const delayTimer = setTimeout(() => {
        setShowLoading(true);
        setLoadingStartTime(Date.now());
      }, 300);

      return () => clearTimeout(delayTimer);
    } else if (showLoading && loadingStartTime) {
      // If we're showing loading and loading just finished,
      // ensure minimum duration before hiding
      const elapsed = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, 500 - elapsed);

      if (remainingTime > 0) {
        const minimumTimer = setTimeout(() => {
          setShowLoading(false);
          setLoadingStartTime(null);
        }, remainingTime);

        return () => clearTimeout(minimumTimer);
      } else {
        setShowLoading(false);
        setLoadingStartTime(null);
      }
    }
  }, [isLoading, showLoading, loadingStartTime]);

  if (!showLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading
    </div>
  );
}
