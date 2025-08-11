import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type UseIntervalRouterRefreshOptions = {
  enabled: boolean;
  intervalMs?: number;
  maxDurationMs?: number;
};

/**
 * Hook that automatically refreshes the router at regular intervals when enabled.
 * Automatically stops after a maximum duration to prevent infinite polling.
 *
 * @param options Configuration options
 * @param options.enabled Whether the interval should be active
 * @param options.intervalMs Interval between refreshes in milliseconds (default: 5000)
 * @param options.maxDurationMs Maximum duration to keep polling in milliseconds (default: 60000)
 */
export function useIntervalRouterRefresh({
  enabled,
  intervalMs = 5000,
  maxDurationMs = 60000,
}: UseIntervalRouterRefreshOptions) {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startTimeRef.current = null;
      return;
    }

    // Record start time when first enabled
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    intervalRef.current = setInterval(() => {
      // Stop polling after maximum duration
      const elapsed = Date.now() - (startTimeRef.current || 0);
      if (elapsed > maxDurationMs) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        startTimeRef.current = null;
        return;
      }

      console.log(`🔄 Refreshing router (${Math.round(elapsed / 1000)}s elapsed)`);
      router.refresh();
    }, intervalMs);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, maxDurationMs, , router]);
}
