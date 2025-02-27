import { useQuery } from "@tanstack/react-query";
import { fetchUserChallenges } from "~~/services/api/userChallenges";

export function useUserChallenges(address: string | undefined) {
  return useQuery({
    queryKey: ["userChallenges", address],
    queryFn: () => fetchUserChallenges(address),
    enabled: Boolean(address),
  });
}
