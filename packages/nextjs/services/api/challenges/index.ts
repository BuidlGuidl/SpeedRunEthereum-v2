import { ChallengeSubmitPayload } from "~~/app/api/challenges/[challengeId]/submit/route";

export const submitChallenge = async ({
  challengeId,
  userAddress,
  frontendUrl,
  contractUrl,
  signature,
}: ChallengeSubmitPayload & { challengeId: string }) => {
  const response = await fetch(`/api/challenges/${challengeId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userAddress,
      frontendUrl,
      contractUrl,
      signature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit challenge: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
