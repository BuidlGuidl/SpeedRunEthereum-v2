import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserChallenges } from "~~/services/api/user-challenges";
import { ReviewAction } from "~~/services/database/config/types";

export function useUserChallenges(address: string | undefined, options?: { enableAutoRefresh?: boolean }) {
  const startTimeRef = useRef<number | null>(null);

  return useQuery({
    queryKey: ["userChallenges", address],
    queryFn: () => fetchUserChallenges(address),
    enabled: Boolean(address),
    refetchInterval: query => {
      if (!options?.enableAutoRefresh) return false;

      const userChallenges = query.state.data || [];
      const hasSubmittedChallenges = userChallenges.some(
        (challenge: any) => challenge.reviewAction === ReviewAction.SUBMITTED,
      );

      if (hasSubmittedChallenges) {
        if (!startTimeRef.current) {
          startTimeRef.current = Date.now();
        }

        // Stop polling after 1 minute (60,000ms)
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed > 60000) {
          startTimeRef.current = null;
          return false;
        }

        return 5000;
      }

      startTimeRef.current = null;
      return false;
    },
    refetchIntervalInBackground: false,
  });
}
