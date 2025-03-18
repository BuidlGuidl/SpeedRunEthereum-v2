import { useQuery } from "@tanstack/react-query";
import { fetchUserChallengeSubmissions } from "~~/services/api/user-challenge-submissions";

export function useUserChallengeSubmissions(address: string | undefined) {
  return useQuery({
    queryKey: ["userChallengeSubmissions", address],
    queryFn: () => fetchUserChallengeSubmissions(address),
    enabled: Boolean(address),
  });
}
