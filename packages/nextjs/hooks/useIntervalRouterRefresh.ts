import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInterval } from "usehooks-ts";

type UseIntervalRouterRefreshOptions = {
  enabled: boolean;
  intervalMs?: number;
  maxDurationMs?: number;
  onTimeout?: () => void;
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
  onTimeout,
}: UseIntervalRouterRefreshOptions) {
  const router = useRouter();
  const startTimeRef = useRef<number | null>(null);
  const isStoppedRef = useRef(false);

  const intervalCallback = useCallback(() => {
    // Record start time when first called
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    // Stop polling after maximum duration
    const elapsed = Date.now() - (startTimeRef.current || 0);
    if (elapsed > maxDurationMs) {
      isStoppedRef.current = true;
      onTimeout?.();
      return;
    }

    console.log(`🔄 Refreshing router (${Math.round(elapsed / 1000)}s elapsed)`);
    router.refresh();
  }, [router, maxDurationMs, onTimeout]);

  // Reset when enabled changes
  if (!enabled) {
    startTimeRef.current = null;
    isStoppedRef.current = false;
  }

  // Only enable interval if enabled AND not stopped
  useInterval(intervalCallback, enabled && !isStoppedRef.current ? intervalMs : null);
}
