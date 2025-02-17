"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlausible } from "next-plausible";

export const StartBuildingButton = ({ firstChallengeId }: { firstChallengeId: string }) => {
  const router = useRouter();
  const plausible = usePlausible();

  // TODO: test this later
  const handleCtaClick = useCallback(() => {
    plausible("cta");

    setTimeout(() => {
      router.push(`/challenge/${firstChallengeId}`);
    }, 100);
  }, [firstChallengeId, plausible, router]);

  return (
    <button
      onClick={handleCtaClick}
      className="mt-4 px-6 py-3 text-lg font-medium text-white bg-primary rounded-full hover:bg-neutral dark:text-gray-800 transition-colors"
    >
      Start Building on Ethereum
    </button>
  );
};
