"use client";

import Link from "next/link";
import type { MappedChallenges } from "./GroupedChallenges";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import type { UserChallenges } from "~~/services/database/repositories/userChallenges";
import { getChallengeDependenciesInfo } from "~~/utils/dependent-challenges";

export function ChallengeDetails({
  address,
  challenge,
  userChallenges,
  comingSoon,
}: {
  address: Address;
  challenge: MappedChallenges;
  userChallenges: UserChallenges;
  comingSoon?: boolean;
}) {
  const { address: connectedAddress } = useAccount();
  const { completed: builderHasCompletedDependenciesChallenges } = getChallengeDependenciesInfo({
    dependencies: challenge.dependencies || [],
    userChallenges,
  });

  const isChallengeLocked = challenge.disabled || !builderHasCompletedDependenciesChallenges;

  const isUserConnected = connectedAddress === address;

  return (
    <div className="text-base-content/50 hover:text-base-content transition">
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 bg-base-300 rounded-full font-semibold lg:text-lg dark:bg-base-200">
            {challenge.sortOrder}
          </div>
          <h2 className="m-0 font-medium lg:text-xl">
            {!isChallengeLocked && (
              <Link href={`/challenge/${challenge.id}`} className="hover:underline">
                {challenge.challengeName}
              </Link>
            )}
            {isChallengeLocked && challenge.challengeName}
            {comingSoon && ` - Coming Soon`}
          </h2>
        </div>
        {isChallengeLocked && isUserConnected && (
          <button disabled className="btn btn-sm rounded-md opacity-65 disabled:bg-accent disabled:text-accent-content">
            Locked
          </button>
        )}
        {!isChallengeLocked && isUserConnected && (
          <Link href={`/challenge/${challenge.id}`} className="btn btn-primary btn-sm rounded-md">
            Start
          </Link>
        )}
      </div>
      <div className="pl-10">
        <p>{challenge.description}</p>
      </div>
    </div>
  );
}
