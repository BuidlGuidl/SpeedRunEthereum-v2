import { UserChallengeSubmissions } from "~~/services/database/repositories/userChallengeSubmissions";

export async function fetchUserChallengeSubmissions(address: string | undefined) {
  if (!address) return [];

  const response = await fetch(`/api/user-challenge-submissions/${address}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user challenge submissions: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.submissions as UserChallengeSubmissions;
}
