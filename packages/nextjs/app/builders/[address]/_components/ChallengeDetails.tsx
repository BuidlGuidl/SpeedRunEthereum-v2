"use client";

import Link from "next/link";
import type { MappedChallenges } from "./GroupedChallenges";
import type { Address } from "viem";
import { useAccount } from "wagmi";

export function ChallengeDetails({
  address,
  challenge,
  comingSoon,
}: {
  address: Address;
  challenge: MappedChallenges;
  comingSoon?: boolean;
}) {
  const { address: connectedAddress } = useAccount();
  const isProfileOwner = connectedAddress?.toLowerCase() === address.toLowerCase();

  const shortedDescription = challenge.description.split(".")[0];

  return (
    <div className="text-base-content/50 hover:text-base-content transition">
      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 bg-base-300 rounded-full font-semibold text-sm dark:bg-base-200">
              {challenge.sortOrder}
            </div>
            <h2 className="m-0 font-medium">
              <Link href={`/challenge/${challenge.id}`} className="hover:underline">
                {challenge.challengeName}
              </Link>
              {comingSoon && ` - Coming Soon`}
            </h2>
          </div>
          <div className="pl-8">
            <p className="mt-2 mb-0 text-sm">{shortedDescription}.</p>
          </div>
        </div>

        {isProfileOwner && (
          <div className="shrink-0 flex flex-col items-center">
            <Link href={`/challenge/${challenge.id}`} className="btn btn-primary btn-sm rounded-md">
              Start
            </Link>
            <p className="text-base-content mt-2 mb-0 text-xs font-medium">+10 XP</p>
          </div>
        )}
      </div>
    </div>
  );
}
