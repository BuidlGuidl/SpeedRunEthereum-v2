import { UserChallenges } from "~~/services/database/repositories/userChallenges";

export async function fetchUserChallenges(address: string | undefined) {
  if (!address) return [];

  const response = await fetch(`/api/user-challenges/${address}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user challenges");
  }
  const data = await response.json();
  return data.challenges as UserChallenges;
}
